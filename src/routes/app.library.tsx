import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/library")({
  head: () => ({ meta: [{ title: "Biblioteca · Estudio360" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const decks = useQuery({
    queryKey: ["library-decks"],
    queryFn: async () => (await supabase.from("decks").select("id,title,subject,topic,created_at,flashcards(count)").order("created_at", { ascending: false })).data ?? [],
  });
  const quizzes = useQuery({
    queryKey: ["library-quizzes"],
    queryFn: async () => (await supabase.from("quizzes").select("id,title,subject,topic,created_at,questions(count)").order("created_at", { ascending: false })).data ?? [],
  });

  const dupDeck = useMutation({
    mutationFn: async (id: string) => {
      const { data: src } = await supabase.from("decks").select("*").eq("id", id).single();
      const { data: cards } = await supabase.from("flashcards").select("front,back,position").eq("deck_id", id);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newDeck, error } = await supabase.from("decks").insert({
        title: `${src!.title} (copia)`, description: src!.description, subject: src!.subject, topic: src!.topic, owner_id: user!.id,
      }).select().single();
      if (error) throw error;
      if (cards?.length) {
        await supabase.from("flashcards").insert(cards.map((c) => ({ ...c, deck_id: newDeck.id })));
      }
      return newDeck.id;
    },
    onSuccess: () => { toast.success("Tarjeta duplicada"); qc.invalidateQueries({ queryKey: ["library-decks"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const delDeck = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("decks").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Tarjeta eliminada"); qc.invalidateQueries({ queryKey: ["library-decks"] }); },
  });

  const delQuiz = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("quizzes").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Cuestionario eliminado"); qc.invalidateQueries({ queryKey: ["library-quizzes"] }); },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Biblioteca</h1>
          <p className="text-muted-foreground">Todo tu contenido en un solo lugar.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: "/app/decks/new" })}><Plus className="h-4 w-4" /> Tarjeta</Button>
          <Button variant="secondary" onClick={() => navigate({ to: "/app/quizzes/new" })}><Plus className="h-4 w-4" /> Cuestionario</Button>
        </div>
      </div>

      <Tabs defaultValue="decks">
        <TabsList>
          <TabsTrigger value="decks"><BookOpen className="mr-2 h-4 w-4" />Tarjetas</TabsTrigger>
          <TabsTrigger value="quizzes"><GraduationCap className="mr-2 h-4 w-4" />Cuestionarios</TabsTrigger>
        </TabsList>

        <TabsContent value="decks" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(decks.data ?? []).map((d) => (
              <Card key={d.id} className="group transition hover:shadow-[var(--shadow-soft)]">
                <CardContent className="p-5">
                  <Link to="/app/decks/$id" params={{ id: d.id }} className="block">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary">{d.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[d.subject, d.topic].filter(Boolean).join(" · ") || "Sin tema"} · {(d as { flashcards?: { count: number }[] }).flashcards?.[0]?.count ?? 0} fichas
                    </p>
                  </Link>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => dupDeck.mutate(d.id)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar tarjeta?")) delDeck.mutate(d.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {decks.data?.length === 0 && <Empty text="Aún no tienes tarjetas." />}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(quizzes.data ?? []).map((q) => (
              <Card key={q.id} className="group transition hover:shadow-[var(--shadow-soft)]">
                <CardContent className="p-5">
                  <Link to="/app/quizzes/$id" params={{ id: q.id }} className="block">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary">{q.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[q.subject, q.topic].filter(Boolean).join(" · ") || "Sin tema"} · {(q as { questions?: { count: number }[] }).questions?.[0]?.count ?? 0} preguntas
                    </p>
                  </Link>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar cuestionario?")) delQuiz.mutate(q.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {quizzes.data?.length === 0 && <Empty text="Aún no tienes cuestionarios." />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</p>;
}
