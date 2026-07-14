import { SiteNav } from "@/components/SiteNav";
import { AboutPageClient } from "@/components/AboutPageClient";
import { mapAboutForSite } from "@/lib/siteAssets";
import { getAbout } from "@/lib/storage";

export default async function AboutPage() {
  const about = mapAboutForSite(await getAbout());
  return (
    <>
      <SiteNav />
      <AboutPageClient about={about} />
    </>
  );
}
