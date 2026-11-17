import HomeStage from '../components/HomeStage';
import { getHomeContent } from '../lib/home';

// The saved front page is re-read at most once a minute, and straight away
// after it is saved in the workspace.
export const revalidate = 60;

export default async function Home() {
  const content = await getHomeContent();
  return <HomeStage content={content} />;
}
