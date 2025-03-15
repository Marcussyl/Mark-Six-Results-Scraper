export default async (request, context) => {
  const response = await context.next();
  return new Response(response.body, {
    headers: {
      "access-control-allow-origin": "*",
    },
  });
};

export const config = {
  path: "/*",
};
