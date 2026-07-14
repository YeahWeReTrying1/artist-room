import { HomeContent } from "@/components/HomeContent";
import { sortProjectsForFeed } from "@/lib/projectOrder";
import { mapAboutForSite, mapProjectForSite } from "@/lib/siteAssets";
import { getAbout, getProjects } from "@/lib/storage";

export default async function HomePage() {
  const [projects, about] = await Promise.all([getProjects(), getAbout()]);
  const publishedProjects = sortProjectsForFeed(
    projects.filter((project) => project.published && !project.archived)
  ).map(mapProjectForSite);

  return <HomeContent projects={publishedProjects} about={mapAboutForSite(about)} />;
}
