import { WizardClient } from "@/components/WizardClient";

// The wizard reads its record id from the query string. In Next 15,
// searchParams is a Promise on server components.
export default async function WizardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <WizardClient id={id ?? null} />;
}
