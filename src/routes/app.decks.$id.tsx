import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Save, Play, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AssignDialog } from "@/components/AssignDialog";

export const Route = createFileRoute("/app/decks/$id")({
  head: () => ({ meta: [{ title: "Tarjeta · Estudio360" }] }),
  component: DeckEditor,
});

interface DraftCard { id?: string; front: string; back: string; position: number; }

function DeckEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<DraftCard[]>([{ front: "", back: "", position: 0 }]);
  const [deckId, setDeckId] = useState<string | null>(isNew ? null : id);
  const [assignOpen, setAssignOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["deck", id],
    enabled: !isNew,
    queryFn: async () => {
      const [d, c] = await Promise.all([
        supabase.from("decks").select("*").eq("id", id).single(),
        supabase.from("flashcards").select("*").eq("deck_id", id).order("position"),
      ]);
      return { deck: d.data, cards: c.data ?? [] };
    },
  });

  useEffect(() => {
    if (data?.deck) {
      setTitle(data.deck.title);
      setDescription(data.deck.description ?? "");
      setSubject(data.deck.subject ?? "");
      setTopic(data.deck.topic ?? "");
      setCards(data.cards.length ? data.cards.map((c) => ({ id: c.id, front: c.front, back: c.back, position: c.position })) : [{ front: "", back: "", position: 0 }]);
    }
  }, [data]);

  const save = async () => {
    if (!title.trim()) return toast.error("Pon un título");
    const { data: { user } } = await supabase.auth.getUser();
    let currentId = deckId;
    if (!currentId) {
      const { data: d, error } = await supabase.from("decks").insert({
        title, description, subject, topic, owner_id: user!.id,
      }).select().single();
      if (error) return toast.error(error.message);
      currentId = d.id;
      setDeckId(currentId);
    } else {
      await supabase.from("decks").update({ title, description, subject, topic }).eq("id", currentId);
    }
    // replace cards: simple strategy — delete all and reinsert
    await supabase.from("flashcards").delete().eq("deck_id", currentId);
    const valid = cards.filter((c) => c.front.trim() && c.back.trim());
    if (valid.length) {
      await supabase.from("flashcards").insert(valid.map((c, i) => ({ deck_id: currentId, front: c.front, back: c.back, position: i })));
    }
    toast.success("Tarjeta guardada");
    if (isNew) navigate({ to: "/app/decks/$id", params: { id: currentId! } });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild><Link to="/app/library"><ArrowLeft className="h-4 w-4" /> Volver</Link></Button>

      <Card>
        <CardHeader><CardTitle className="font-display">{isNew ? "Nueva tarjeta" : "Editar tarjeta"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Verbos irregulares en inglés" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Curso / Asignatura</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Inglés" /></div>
            <div className="space-y-2"><Label>Tema</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Unidad 3" /></div>
          </div>
          <div className="space-y-2"><Label>Descripción</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Tarjetas ({cards.length})</h2>
          <Button size="sm" variant="outline" onClick={() => setCards([...cards, { front: "", back: "", position: cards.length }])}><Plus className="h-4 w-4" /> Añadir</Button>
        </div>
        {cards.map((c, i) => (
          <Card key={i}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Anverso #{i + 1}</Label>
                <Textarea value={c.front} onChange={(e) => setCards(cards.map((x, j) => j === i ? { ...x, front: e.target.value } : x))} rows={2} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Reverso</Label>
                <Textarea value={c.back} onChange={(e) => setCards(cards.map((x, j) => j === i ? { ...x, back: e.target.value } : x))} rows={2} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => setCards(cards.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-[var(--shadow-soft)] backdrop-blur">
        {deckId && (
          <>
            <Button variant="outline" onClick={() => setAssignOpen(true)}><Share2 className="h-4 w-4" /> Asignar</Button>
            <Button variant="secondary" asChild><Link to="/app/study/deck/$id" params={{ id: deckId }}><Play className="h-4 w-4" /> Vista alumno</Link></Button>
          </>
        )}
        <Button onClick={save}><Save className="h-4 w-4" /> Guardar</Button>
      </div>

      {deckId && <AssignDialog open={assignOpen} onOpenChange={setAssignOpen} contentType="deck" contentId={deckId} />}
    </div>
  );
}
