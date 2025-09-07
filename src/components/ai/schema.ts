// This enum is based on the GoogleGenerativeAI SDK to avoid importing it on the client.
// It's used to construct the schema for AI analysis requests sent to the serverless function.
export enum Type {
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  NULL = 'NULL',
}
