import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, GraduationCap, TrendingUp, Users, Brain } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estudio360 — Aprende mejor, evalúate inteligente" },
      { name: "description", content: "Plataforma educativa para profesores y alumnos. Flashcards, autoevaluaciones y seguimiento del progreso." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Estudio360</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/login">Entrar</Link></Button>
          <Button asChild><Link to="/login" search={{ mode: "signup" } as never}>Crear cuenta</Link></Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-20">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Brain className="h-3.5 w-3.5" /> Aprendizaje activo · Autoevaluación · Progreso
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Aprende mejor. <span className="text-primary">Evalúate inteligente.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Estudio360 conecta profesores y alumnos en una plataforma simple para crear flashcards,
            quizzes y seguir el progreso real del aprendizaje.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/login" search={{ mode: "signup" } as never}>Empezar gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        <section className="mt-24 grid gap-5 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Flashcards inteligentes", text: "Crea, asigna y repasa tarjetas. Repite las que fallas." },
            { icon: GraduationCap, title: "Quizzes con feedback", text: "Autoevaluación inmediata, resultados al instante." },
            { icon: TrendingUp, title: "Progreso visible", text: "Métricas claras de aciertos, errores y tiempo de estudio." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] md:grid-cols-2">
          <div>
            <Users className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-display text-2xl font-semibold">Para profesores</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>· Crea decks y quizzes con un editor claro</li>
              <li>· Organiza por curso, tema y unidad</li>
              <li>· Asigna a clases o a alumnos concretos</li>
              <li>· Ve el progreso individual y de toda la clase</li>
            </ul>
          </div>
          <div>
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-display text-2xl font-semibold">Para alumnos</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>· Estudia lo asignado por tu profesor</li>
              <li>· Resultados inmediatos al terminar</li>
              <li>· Repasa solo lo que has fallado</li>
              <li>· Métricas personales de progreso</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Estudio360 · Aprender es un acto diario.
      </footer>
    </div>
  );
}
