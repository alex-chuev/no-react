import { describe, expect, it } from 'vitest';
import { createElementWith } from '../lib/createElement';
import { defaultFactories } from '../lib/factories/defaultFactories';
import { ElementComponent, defaultElementDependencies } from '../lib/ElementComponent';
import { PropertyBinder, reservedBinding, staticBinding } from '../lib/dom/PropertyBinder';
import { attributeWriter, PropertyWriterChain } from '../lib/dom/PropertyWriter';

describe('extension points', () => {
  it('creates elements with additional factories', () => {
    const createElement = createElementWith([
      {matches: type => type === 'hr-line', create: () => createElement('hr')},
      ...defaultFactories,
    ]);

    expect(createElement('hr-line').element.tagName).toBe('HR');
  });

  it('rejects element types no factory matches', () => {
    expect(() => createElementWith(defaultFactories)(42)).toThrow(TypeError);
  });

  it('binds properties with injected bindings and writers', () => {
    const properties = new PropertyBinder([reservedBinding, staticBinding], new PropertyWriterChain([{...attributeWriter, matches: () => true}]));
    const view = new ElementComponent('input', {value: 'x'}, [], {...defaultElementDependencies, properties});

    expect(view.element.getAttribute('value')).toBe('x');
  });
});
