import "dotenv/config"
import { defineConfig } from "orval"
import { env } from "./src/lib/env"

export default defineConfig({
  tassawoqApi: {
    input: {
      target: `${env.NEXT_PUBLIC_API_URL}/reference.json`,
    },
    output: {
      mode: "tags",
      target: "./src/api/generated/react-query",
      schemas: "./src/api/generated/model",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useInfinite: true,
          useInfiniteQueryParam: "page",
          shouldExportQueryKey: true,
          useInvalidate: true,
        },
      },
    },
  },
})
