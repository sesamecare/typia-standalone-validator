# typia-standalone-validator

This package creates a bundle standalone validator for a Typescript type using Typia. It basically just runs npx a couple times to do the dance and generate a single js file that will validate a given Javascript object against a Typescript type at runtime.

```
npx @sesamecare-oss/typia-standalone-validator <source file with TS type decl> <type> --project <your tsconfig.json> --o <output file>
```
