const sections = [
  {
    title: "Éditeur du site",
    body: "UrbanFlow est un projet indépendant édité dans le cadre d'un usage non commercial, et créer dans le cadre d'un projet professionnel de fin de parcours, et qui est dédié à la mobilité urbaine sur la métropole de Nantes. Contact : elea.ya.pro@gmail.com.",
  },
  {
    title: "Hébergement",
    body: "L'application est hébergée par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
  },
  {
    title: "Propriété intellectuelle",
    body: "L'ensemble des contenus présents sur UrbanFlow (textes, mises en page, éléments graphiques) est protégé au titre du droit d'auteur. Toute reproduction sans autorisation préalable est interdite.",
  },
  {
    title: "Données personnelles",
    body: "Les données transmises via votre compte (email, préférences, historique de trajets) sont utilisées exclusivement pour le fonctionnement du service. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données, exerçable depuis la page Préférences ou par email.",
  },
  {
    title: "Cookies",
    body: "UrbanFlow utilise uniquement les cookies strictement nécessaires au fonctionnement du service (authentification, préférences). Aucun cookie publicitaire ou de traçage tiers n'est déposé.",
  },
  {
    title: "Sources de données",
    body: "Les horaires et disponibilités affichés proviennent des données ouvertes de Nantes Métropole et du réseau Naolib, mises à jour en temps réel dans la mesure du possible.",
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-2xl font-semibold">Mentions légales</h1>
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
