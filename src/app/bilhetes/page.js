import BilhetesContent from "./BilhetesContent";

export default async function BilhetesPage({ searchParams }) {

  const params = await searchParams;
  const casa = params?.casa || null;

  return <BilhetesContent casa={casa} />;
}