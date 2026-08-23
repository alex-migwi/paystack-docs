import spec from '../public/paystack.json';
import changelog from '../public/changelog.json';

export interface ParameterField {
  name: string;
  in: 'path' | 'query' | 'body' | 'header';
  type: string;
  required: boolean;
  description?: string;
  default?: any;
  enum?: string[];
  example?: any;
}

export interface CodeSample {
  lang: string;
  label: string;
  source: string;
}

export interface EndpointDetails {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters: ParameterField[];
  requestBodyFields: ParameterField[];
  xCodeSamples?: CodeSample[];
  xIdempotency?: boolean;
  xRetrySafe?: boolean;
  xPagination?: any;
}

export interface EndpointRoute {
  category: string;
  endpoint: string;
  aliases?: string[];
  path: string;
  method: string;
  summary: string;
  tag: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_/]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Dereference a $ref string like '#/components/schemas/Currency'
 */
export function resolveRef(ref: string, rootSpec: any = spec): any {
  if (!ref || !ref.startsWith('#/')) return null;
  const parts = ref.replace(/^#\//, '').split('/');
  let current: any = rootSpec;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  return current;
}

/**
 * Normalizes dynamic path parameters: e.g. converts /transaction/verify/:reference or /transaction/verify/{reference}
 */
export function findPathKey(targetPath: string): string | null {
  const normalizedTarget = targetPath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
  
  if (spec.paths && spec.paths[normalizedTarget as keyof typeof spec.paths]) {
    return normalizedTarget;
  }

  // Exact match search fallback
  const keys = Object.keys(spec.paths || {});
  for (const key of keys) {
    if (key.toLowerCase() === normalizedTarget.toLowerCase()) {
      return key;
    }
  }

  return null;
}

/**
 * Resolves schema object (following $ref if necessary)
 */
function resolveSchema(schemaObj: any): any {
  if (!schemaObj) return null;
  if (schemaObj.$ref) {
    const resolved = resolveRef(schemaObj.$ref);
    return resolveSchema(resolved);
  }
  return schemaObj;
}

/**
 * Helper to purge undefined properties for Next.js getStaticProps serialization
 */
function cleanUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Extract all properties from a schema (including allOf combinations)
 */
function extractPropertiesFromSchema(schemaObj: any): { properties: Record<string, any>; required: string[] } {
  const schema = resolveSchema(schemaObj);
  if (!schema) return { properties: {}, required: [] };

  const properties: Record<string, any> = {};
  const required: string[] = Array.isArray(schema.required) ? [...schema.required] : [];

  if (schema.properties) {
    Object.assign(properties, schema.properties);
  }

  if (Array.isArray(schema.allOf)) {
    for (const sub of schema.allOf) {
      const extracted = extractPropertiesFromSchema(sub);
      Object.assign(properties, extracted.properties);
      required.push(...extracted.required);
    }
  }

  return { properties, required: Array.from(new Set(required)) };
}

/**
 * Extract parameter & request body schema details for a given endpoint and HTTP method
 */
export function getEndpointDetails(endpoint: string, method: string): EndpointDetails {
  const pathKey = findPathKey(endpoint);
  const pathObj = pathKey && spec.paths ? (spec.paths as any)[pathKey] : null;
  const operation = pathObj ? pathObj[method.toLowerCase()] : null;

  const parameters: ParameterField[] = [];
  const requestBodyFields: ParameterField[] = [];

  if (operation) {
    // 1. Path & Query parameters (combine path-level and operation-level parameters)
    const combinedParams = [
      ...(Array.isArray(pathObj.parameters) ? pathObj.parameters : []),
      ...(Array.isArray(operation.parameters) ? operation.parameters : []),
    ];

    const seenParams = new Set<string>();

    for (const rawParam of combinedParams) {
      const param = resolveSchema(rawParam);
      if (!param || !param.name) continue;

      const paramKey = `${param.in || 'query'}:${param.name}`;
      if (seenParams.has(paramKey)) continue;
      seenParams.add(paramKey);

      const schema = resolveSchema(param.schema);
      parameters.push({
        name: param.name,
        in: param.in || 'query',
        type: schema?.type || (typeof param.example === 'number' ? 'integer' : 'string'),
        required: Boolean(param.required),
        description: param.description || '',
        ...(schema?.enum ? { enum: schema.enum } : {}),
        ...(param.example !== undefined ? { example: param.example } : {}),
      });
    }

    // 2. Request body parameters (JSON / form-urlencoded)
    const rawRequestBody = resolveSchema(operation.requestBody);
    const requestBodyContent = rawRequestBody?.content;
    const bodySchemaObj =
      requestBodyContent?.['application/json']?.schema ||
      requestBodyContent?.['application/x-www-form-urlencoded']?.schema;

    if (bodySchemaObj) {
      const { properties, required: requiredList } = extractPropertiesFromSchema(bodySchemaObj);
      for (const [propName, propDef] of Object.entries<any>(properties)) {
        const resolvedProp = resolveSchema(propDef);
        requestBodyFields.push({
          name: propName,
          in: 'body',
          type: resolvedProp?.type || 'string',
          required: requiredList.includes(propName),
          description: resolvedProp?.description || '',
          ...(resolvedProp?.enum ? { enum: resolvedProp.enum } : {}),
          ...(resolvedProp?.example !== undefined ? { example: resolvedProp.example } : {}),
        });
      }
    }
  }

  const result: EndpointDetails = {
    summary: operation?.summary || '',
    description: operation?.description || '',
    operationId: operation?.operationId || '',
    parameters,
    requestBodyFields,
    ...(operation?.['x-code-samples'] ? { xCodeSamples: operation['x-code-samples'] } : {}),
    ...(operation?.['x-idempotency'] !== undefined ? { xIdempotency: Boolean(operation['x-idempotency']) } : {}),
    ...(operation?.['x-retry-safe'] !== undefined ? { xRetrySafe: Boolean(operation['x-retry-safe']) } : {}),
    ...(operation?.['x-pagination'] ? { xPagination: operation['x-pagination'] } : {}),
  };

  return cleanUndefined(result);
}

/**
 * Get all endpoint routes formatted for Next.js dynamic routing
 */
export function getAllEndpointRoutes(): EndpointRoute[] {
  const routes: EndpointRoute[] = [];
  const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];

  for (const [pathUrl, pathObjObject] of Object.entries(spec.paths || {})) {
    const pathItem = pathObjObject as any;
    for (const method of httpMethods) {
      const op = pathItem[method];
      if (!op) continue;

      const tag = op.tags?.[0] || 'General';
      const categorySlug = slugify(tag);
      
      // Determine primary endpoint slug & aliases
      const opIdSlug = op.operationId ? slugify(op.operationId) : '';
      const pathClean = pathUrl.replace(/^\//, '').replace(/[\{\}:]/g, '');
      const pathParts = pathClean.split('/');
      const lastPathPartSlug = slugify(pathParts[pathParts.length - 1] || '');

      let primarySlug = lastPathPartSlug;
      if (!primarySlug || primarySlug === categorySlug) {
        primarySlug = opIdSlug || slugify(`${method}-${pathClean}`);
      }

      const aliases = Array.from(new Set([opIdSlug, slugify(`${method}-${pathClean}`), slugify(pathClean)]).values()).filter(
        (a) => a && a !== primarySlug
      );

      routes.push({
        category: categorySlug,
        endpoint: primarySlug,
        aliases,
        path: pathUrl,
        method: method.toUpperCase(),
        summary: op.summary || '',
        tag,
      });
    }
  }

  return cleanUndefined(routes);
}

/**
 * Query diff changelog status for a path and method
 */
export function getChangelogStatus(pathUrl: string, method: string): 'added' | 'modified' | 'unchanged' {
  const targetKey = `${method.toUpperCase()} ${pathUrl}`;
  if (changelog.added?.some((item: any) => item.endpointKey === targetKey)) {
    return 'added';
  }
  if (changelog.modified?.some((item: any) => item.endpointKey === targetKey)) {
    return 'modified';
  }
  return 'unchanged';
}
