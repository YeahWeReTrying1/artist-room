import { notFound } from "next/navigation";
import { ArtistProjectPageClient } from "@/components/ArtistProjectPageClient";
import { canOpenProject } from "@/lib/projectAccess";
import { mapProjectForSite } from "@/lib/siteAssets";
import { getProjects } from "@/lib/storage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects
    .filter((item) => item.published && !item.archived && canOpenProject(item) && item.slug)
    .map((item) => ({ slug: item.slug }));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find(
    (item) => item.slug === slug && item.published && !item.archived
  );

  if (!project || !canOpenProject(project)) {
    notFound();
  }

  return <ArtistProjectPageClient project={mapProjectForSite(project)} />;
}
