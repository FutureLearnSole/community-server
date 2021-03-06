import { Readable } from 'stream';
import { namedNode, triple } from '@rdfjs/data-model';
import arrayifyStream from 'arrayify-stream';
import rdfParser from 'rdf-parse';
import streamifyArray from 'streamify-array';
import { Representation } from '../../../../src/ldp/representation/Representation';
import { RepresentationPreferences } from '../../../../src/ldp/representation/RepresentationPreferences';
import { ResourceIdentifier } from '../../../../src/ldp/representation/ResourceIdentifier';
import { RdfToQuadConverter } from '../../../../src/storage/conversion/RdfToQuadConverter';
import { INTERNAL_QUADS } from '../../../../src/util/ContentTypes';
import { UnsupportedHttpError } from '../../../../src/util/errors/UnsupportedHttpError';

describe('A RdfToQuadConverter.test.ts', (): void => {
  const converter = new RdfToQuadConverter();
  const identifier: ResourceIdentifier = { path: 'path' };

  it('supports parsing the same types as rdfParser.', async(): Promise<void> => {
    await expect(converter.getInputTypes()).resolves.toEqual(await rdfParser.getContentTypesPrioritized());
  });

  it('supports serializing as quads.', async(): Promise<void> => {
    await expect(converter.getOutputTypes()).resolves.toEqual({ [INTERNAL_QUADS]: 1 });
  });

  it('can handle turtle to quad conversions.', async(): Promise<void> => {
    const representation = { metadata: { contentType: 'text/turtle' }} as Representation;
    const preferences: RepresentationPreferences = { type: [{ value: INTERNAL_QUADS, weight: 1 }]};
    await expect(converter.canHandle({ identifier, representation, preferences })).resolves.toBeUndefined();
  });

  it('can handle JSON-LD to quad conversions.', async(): Promise<void> => {
    const representation = { metadata: { contentType: 'application/ld+json' }} as Representation;
    const preferences: RepresentationPreferences = { type: [{ value: INTERNAL_QUADS, weight: 1 }]};
    await expect(converter.canHandle({ identifier, representation, preferences })).resolves.toBeUndefined();
  });

  it('converts turtle to quads.', async(): Promise<void> => {
    const representation = {
      data: streamifyArray([ '<http://test.com/s> <http://test.com/p> <http://test.com/o>.' ]),
      metadata: { contentType: 'text/turtle' },
    } as Representation;
    const preferences: RepresentationPreferences = { type: [{ value: INTERNAL_QUADS, weight: 1 }]};
    const result = await converter.handle({ identifier, representation, preferences });
    expect(result).toEqual({
      binary: false,
      data: expect.any(Readable),
      metadata: {
        contentType: INTERNAL_QUADS,
      },
    });
    await expect(arrayifyStream(result.data)).resolves.toEqualRdfQuadArray([ triple(
      namedNode('http://test.com/s'),
      namedNode('http://test.com/p'),
      namedNode('http://test.com/o'),
    ) ]);
  });

  it('converts JSON-LD to quads.', async(): Promise<void> => {
    const representation = {
      data: streamifyArray([ '{"@id": "http://test.com/s", "http://test.com/p": { "@id": "http://test.com/o" }}' ]),
      metadata: { contentType: 'application/ld+json' },
    } as Representation;
    const preferences: RepresentationPreferences = { type: [{ value: INTERNAL_QUADS, weight: 1 }]};
    const result = await converter.handle({ identifier, representation, preferences });
    expect(result).toEqual({
      binary: false,
      data: expect.any(Readable),
      metadata: {
        contentType: INTERNAL_QUADS,
      },
    });
    await expect(arrayifyStream(result.data)).resolves.toEqualRdfQuadArray([ triple(
      namedNode('http://test.com/s'),
      namedNode('http://test.com/p'),
      namedNode('http://test.com/o'),
    ) ]);
  });

  it('throws an UnsupportedHttpError on invalid triple data.', async(): Promise<void> => {
    const representation = {
      data: streamifyArray([ '<http://test.com/s> <http://test.com/p> <http://test.co' ]),
      metadata: { contentType: 'text/turtle' },
    } as Representation;
    const preferences: RepresentationPreferences = { type: [{ value: INTERNAL_QUADS, weight: 1 }]};
    const result = await converter.handle({ identifier, representation, preferences });
    expect(result).toEqual({
      binary: false,
      data: expect.any(Readable),
      metadata: {
        contentType: INTERNAL_QUADS,
      },
    });
    await expect(arrayifyStream(result.data)).rejects.toThrow(UnsupportedHttpError);
  });
});
