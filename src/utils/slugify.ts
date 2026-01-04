import slugify from 'slugify';
export function makeSlug(s: string){ return slugify(s, { lower: true, strict: true }); }
