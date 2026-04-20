/**
 * JSON-LD structured data render helper.
 * <JsonLd data={organizationJsonLd()} /> şeklinde kullan.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
