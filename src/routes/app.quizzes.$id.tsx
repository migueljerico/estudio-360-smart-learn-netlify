import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Save, Play, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AssignDialog } from "@/components/AssignDialog";

export const Route = createFileRoute("/app/quizzes/$id")({
  head: () => ({ meta: [{ title: "Cuestionario · Estudio360" }] }),
  component: QuizEditor,
});

interface DraftAnswer { id?: string; text: string; is_correct: boolean; }
interface DraftQuestion { id?: string; prompt: string; answers: DraftAnswer[]; }

function QuizEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { prompt: "", answers: [{ text: "", is_correct: true }, { text: "", is_correct: false }] },
  ]);
  const [quizId, setQuizId] = useState<string | null>(isNew ? null : id);
  const [assignOpen, setAssignOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["quiz", id],
    enabled: !isNew,
    queryFn: async () => {
      const q = await supabase.from("quizzes").select("*").eq("id", id).single();
      const qs = await supabase.from("questions").select("*, answers(*)").eq("quiz_id", id).order("position");
      return { quiz: q.data, questions: qs.data ?? [] };
    },
  });

  useEffect(() => {
    if (data?.quiz) {
      setTitle(data.quiz.title);
      setDescription(data.quiz.description ?? "");
      setSubject(data.quiz.subject ?? "");
      setTopic(data.quiz.topic ?? "");
      type Q = { id: string; prompt: string; answers: { id: string; text: string; is_correct: boolean; position: number }[] };
      const qs = data.questions as unknown as Q[];
      if (qs.length) {
        setQuestions(qs.map((q) => ({
          id: q.id, prompt: q.prompt,
          answers: [...q.answers].sort((a, b) => a.position - b.position).map((a) => ({ id: a.id, text: a.text, is_correct: a.is_correct })),
        })));
      }
    }
  }, [data]);

  const save = async () => {
    if (!title.trim()) return toast.error("Pon un título");
    const { data: { user } } = await supabase.auth.getUser();
    let currentId = quizId;
    if (!currentId) {
      const { data: q, error } = await supabase.from("quizzes").insert({ title, description, subject, topic, owner_id: user!.id }).select().single();
      if (error) return toast.error(error.message);
      currentId = q.id;
      setQuizId(currentId);
    } else {
      await supabase.from("quizzes").update({ title, description, subject, topic }).eq("id", currentId);
    }
    // simple: delete all & reinsert
    await supabase.from("questions").delete().eq("quiz_id", currentId);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) continue;
      const validAnswers = q.answers.filter((a) => a.text.trim());
      if (validAnswers.length < 2 || !validAnswers.some((a) => a.is_correct)) {
        toast.error(`La pregunta #${i + 1} necesita al menos 2 respuestas y una marcada como correcta`);
        return;
      }
      const { data: insertedQ, error } = await supabase.from("questions").insert({ quiz_id: currentId, prompt: q.prompt, position: i }).select().single();
      if (error) return toast.error(error.message);
      await supabase.from("answers").insert(validAnswers.map((a, j) => ({ question_id: insertedQ.id, text: a.text, is_correct: a.is_correct, position: j })));
    }
    toast.success("Cuestionario guardado");
    if (isNew) navigate({ to: "/app/quizzes/$id", params: { id: currentId! } });
  };

  const updateQ = (i: number, patch: Partial<DraftQuestion>) => setQuestions(questions.map((q, j) => j === i ? { ...q, ...patch } : q));
  const updateA = (qi: number, ai: number, patch: Partial<DraftAnswer>) => {
    const next = [...questions];
    next[qi] = { ...next[qi], answers: next[qi].answers.map((a, j) => j === ai ? { ...a, ...patch } : a) };
    setQuestions(next);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild><Link to="/app/library"><ArrowLeft className="h-4 w-4" /> Volver</Link></Button>

      <Card>
        <CardHeader><CardTitle className="font-display">{isNew ? "Nuevo cuestionario" : "Editar cuestionario"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Asignatura</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-2"><Label>Tema</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Descripción</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Preguntas ({questions.length})</h2>
          <Button size="sm" variant="outline" onClick={() => setQuestions([...questions, { prompt: "", answers: [{ text: "", is_correct: true }, { text: "", is_correct: false }] }])}><Plus className="h-4 w-4" /> Añadir</Button>
        </div>

        {questions.map((q, qi) => (
          <Card key={qi}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-2">
                <Textarea value={q.prompt} onChange={(e) => updateQ(qi, { prompt: e.target.value })} placeholder={`Pregunta ${qi + 1}`} rows={2} />
                <Button size="sm" variant="ghost" onClick={() => setQuestions(questions.filter((_, j) => j !== qi))}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2">
                {q.answers.map((a, ai) => (
                  <div key={ai} className="flex items-center gap-2">
                    <Checkbox checked={a.is_correct} onCheckedChange={(v) => updateA(qi, ai, { is_correct: !!v })} />
                    <Input value={a.text} onChange={(e) => updateA(qi, ai, { text: e.target.value })} placeholder={`Respuesta ${ai + 1}`} />
                    <Button size="sm" variant="ghost" onClick={() => updateQ(qi, { answers: q.answers.filter((_, j) => j !== ai) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="ghost" onClick={() => updateQ(qi, { answers: [...q.answers, { text: "", is_correct: false }] })}><Plus className="h-3.5 w-3.5" /> Respuesta</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-[var(--shadow-soft)] backdrop-blur">
        {quizId && (
          <>
            <Button variant="outline" onClick={() => setAssignOpen(true)}><Share2 className="h-4 w-4" /> Asignar</Button>
            <Button variant="secondary" asChild><Link to="/app/study/quiz/$id" params={{ id: quizId }}><Play className="h-4 w-4" /> Vista alumno</Link></Button>
          </>
        )}
        <Button onClick={save}><Save className="h-4 w-4" /> Guardar</Button>
      </div>

      {quizId && <AssignDialog open={assignOpen} onOpenChange={setAssignOpen} contentType="quiz" contentId={quizId} />}
    </div>
  );
}
