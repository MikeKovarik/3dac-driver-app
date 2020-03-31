import {Parser, Expression, ComputedExpression, createOverrideContext} from '../node_modules/aurelia-script/dist/aurelia.esm.js'


class ComputedListExpression extends Expression {
  /**
   * @param {string} expressionStr Expression string for one dependency
   */
  constructor(expressionStr) {
    super();
    const parser = new Parser();
    this.expressions = expressionStr.split('[*].').map(part => parser.parse(part));
  }
  /**
   * Connect template interpolation to dependency. Once dependency is changed and subscribers are called this ensures
   * the binding is notified for changes.
   * @param {Binding} binding
   * @param {Scope} rootScope
   */
  connect(binding, rootScope) {
    let currentScopes = [rootScope];
    // Iterate trough expressions e.g. children => Array<Child>, isSelected => boolean
    for (let expression of this.expressions) {
      let scopes = [];
      currentScopes.forEach(scope => {
        scopes = scopes.concat(this.connectAndEvaluate(expression, binding, scope));
      });
      currentScopes = scopes;
    }
  }
  /**
   * Connect current expression to binding with current scope
   * @param {Expression} expression
   * @param {Binding} binding
   * @param {Scope} scope
   * @returns {Array<Scope>}
   */
  connectAndEvaluate(expression, binding, scope) {
    expression.connect(binding, scope);
    const scopes = [];
    let results = expression.evaluate(scope);
    // If result is not a list make it to one
    if (!Array.isArray(results)) {
      results = [results];
    }
    results.forEach(result => {
      scopes.push({bindingContext: result, overrideContext: createOverrideContext(result)});
    });
    return scopes;
  }
}
/**
 * Mark getter to be computed from a list. This decorator allows to use properties of objects in arrays as dependencies.
 * This works like common computedFrom except that arrays can be accessed by appending [*]. to properties of type array
 * @param {Array<string>} expressions Expressions like children[*].property
 * @returns {Function}
 */
export function computedFromList(...expressions) {
  return function(target, property, descriptor) {
    const dependencies = expressions.map(expression => new ComputedListExpression(expression));
    descriptor.get.dependencies = new ComputedExpression(property, dependencies);
  };
}