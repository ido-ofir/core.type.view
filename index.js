module.exports = {
    name: 'core.type.view',
    dependencies: [
        'core.plugin.type',
        'core.loader.types',
        'core.type.component',
    ],
    extend: {
        views: {},
        View(name, dependencies, get, done) {
            if(Array.isArray(name)){
                return name.map(this.View);
            }
            var definition = this.type.getDefinitionObject(name, dependencies, get, 'view', done);
            
            var source = this.type.toSource({
                id: definition.name,
                key: definition.name,
                type: 'view',
                description: definition.description || '',
              }, definition);
        
            return this.build(source, definition.done);
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
        build(definition, done) {

            var core = this;

            var { name, dependencies, get, bindings } = definition;

            core.Module(name, dependencies, function(modules){

                modules = [].slice.call(arguments);
                var Component = core.createComponent(name + '.element', get.apply(core, modules));
                var View = core.createComponent(name, {
                    render() {

                        return core.bind(bindings, (state) => {
                            var props = core.assign({}, this.props, state);
                            core.monitor('views.render', { name: name, props: props })
                            return core.createElement({
                                ref(el){ this.element = el },
                                type: Component,
                                props: props,
                                children: props.children
                            });
                        });
                    }
                });
                return View;

            }, function(view){

                core.components[name] = view;
                core.views[name] = view;
                done && done(view);
                
            });
        }
    }]
};