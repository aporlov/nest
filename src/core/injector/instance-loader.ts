import { NestContainer } from './container';
import { Injector } from './injector';
import { Injectable } from '../../common/interfaces/injectable.interface';
import { Controller } from '../../common/interfaces/controller.interface';
import { Module } from './module';
import { Logger } from '../../common/services/logger.service';
import { getModuleInitMessage } from '../helpers/messages';
import { NestMode } from '../../common/enums/nest-mode.enum';

export class InstanceLoader {
    private injector = new Injector();
    private readonly logger = new Logger(InstanceLoader.name);

    constructor(
        private container: NestContainer,
        private mode = NestMode.RUN) {}

    createInstancesOfDependencies() {
        const modules = this.container.getModules();

        this.createPrototypes(modules);
        this.createInstances(modules);
    }

    private createPrototypes(modules: Map<string, Module>) {
        modules.forEach((module) => {
            this.createPrototypesOfComponents(module);
            this.createPrototypesOfRoutes(module);
        });
    }

    private createInstances(modules: Map<string, Module>) {
        modules.forEach((module, name) => {
            this.createInstancesOfComponents(module);
            this.createInstancesOfRoutes(module);

            if (this.mode === NestMode.RUN) {
                this.logger.log(getModuleInitMessage(name))
            }
        })
    }

    private createPrototypesOfComponents(module: Module) {
        module.components.forEach((wrapper) => {
            this.injector.loadPrototypeOfInstance<Injectable>(wrapper.metatype, module.components);
        });
    }

    private createInstancesOfComponents(module: Module) {
        module.components.forEach((wrapper) => {
            this.injector.loadInstanceOfComponent(wrapper.metatype, module);
        });
    }

    private createPrototypesOfRoutes(module: Module) {
        module.routes.forEach((wrapper) => {
            this.injector.loadPrototypeOfInstance<Controller>(wrapper.metatype, module.routes);
        });
    }

    private createInstancesOfRoutes(module: Module) {
        module.routes.forEach((wrapper) => {
            this.injector.loadInstanceOfRoute(wrapper.metatype, module);
        });
    }

}