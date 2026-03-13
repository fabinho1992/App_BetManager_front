import BilhetesContent from "./BilhetesContent";

export default function BilhetesPage({ searchParams }) {

  const casa = searchParams?.casa || null;

  return <BilhetesContent casa={casa} />;
}