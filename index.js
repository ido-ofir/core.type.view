module.exports = {
    name: 'core.type.view',
    dependencies: [
        'core.plugin.get-definition-object',
        'core.plugin.build',
        'core.plugin.monitor',
        'core.type.component',
    ],
    extend: {
        views: {},
        View(name, dependencies, get, done) {
            
            var definition = this.getDefinitionObject(name, dependencies, get, 'view', done);
            // console.debug('view', definition);
            return this.build(definition, definition.done);
        },
    },
    types: [{
        name: 'view',
        extends: 'module',
        schema: [
            {
                key: 'name',
                description: 'the name of the view',
                type: 'string'
            },
            {
                key: 'dependencies',
                description: 'the dependencies of the view',
                type: 'array',
                ofType: 'string'
            },
            {
                key: 'get',
                description: 'a function that will return the view definition',
                type: 'function'
            },
            {
                key: 'bindings',
                description: 'an object of paths in the tree to bind to',
                type: 'object',
                ofType: 'array'
            }
        ],
        build(definition, _super, done) {

            var core = this;

            var { name, dependencies, get, bindings } = definition; 

            _super({
                name: name,
                dependencies: dependencies,
                get(modules) {
                    modules = [].slice.call(arguments);
                    var Component = core.createComponent(name, get.apply(this, modules));
                    var View = core.createComponent(name, {
                        render() {

                            return core.bind(bindings, (state) => {
                                var props = core.assign({}, this.props, state);
                                core.monitor('views.render', { name: name, props: props })
                                return core.createElement({
                                    type: Component,
                                    props: props,
                                    children: props.children
                                });
                            });
                        }
                    });
                    return View;
                }
            }, (view) => {
                core.components[name] = view;
                core.views[name] = view;
                done && done(view);
            });
        }
    }]
};