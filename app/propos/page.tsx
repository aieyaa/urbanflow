const features = [
  {
    title: "Itinéraires",
    description:
      "Calculez le trajet le plus adapté en combinant les différents modes de transport sur la métropole de Nantes.",
  }, 
  {
    title: "Disponibilités",
    description:
      "Consultez en temps réel les places disponibles.",
  },
  {
    title: "Horaires",
    description:
      "Suivez les horaires de passage en temps réel des lignes Naolib à chaque arrêt.",
  },
  {
    title: "Vos progrès",
    description:
      "Visualisez l'empreinte carbone de vos déplacements et vos progrès.",
  }, 
];

export default function AProposPage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-12 px-6 py-16">
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">À propos d&apos;UrbanFlow</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          UrbanFlow est une application pensée pour simplifier les
          déplacements du quotidien sur la métropole de Nantes. En
          rassemblant itinéraires, horaires en temps réel et suivi carbone dans un seul outil, elle aide chacun à
          se déplacer. <br />
          Une application pensée et réaliser dans le cadre d'un projet professionnel de fin de parcours.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-2 rounded-xl border border-black/[.08] p-5 dark:border-white/[.145]"
          >
            <h2 className="text-sm font-semibold">{feature.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        UrbanFlow est un projet indépendant, développé pour faciliter la
        mobilité urbaine.
      </p>
    </div>
  );
}
