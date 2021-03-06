const expect = require('chai').expect;
const { Autoroute } = require('../src/Autoroute');
const { Router } = require('express');
const path = require('path');

describe('Autoroute', () => {
  const basePath = path.join(__dirname, './mocks');
  const actionsMap = {
    exists: 'head',
    read: 'get',
    create: 'post',
    update: 'put',
    partial: 'patch',
    destroy: 'delete'
  };
  const autoroute = new Autoroute(Router, actionsMap);

  it('should create a route from a path', () => {
    const filePath = path.join(basePath, '/test.js');

    expect(autoroute.routeFromPath(basePath, filePath)).to.equal('/test');
  });

  it('should not care about uppercase when creating a route', () => {
    const filePath = path.join(basePath, '/SubPath/Test.js');

    expect(autoroute.routeFromPath(basePath, filePath)).to.equal(
      '/sub-path/test'
    );
  });

  it('should find controllers in the base path', () => {
    expect(autoroute.findControllers(basePath)).to.have.members([
      path.join(basePath, '/index.js'),
      path.join(basePath, '/test.js'),
      path.join(basePath, '/subPath/subTest.js')
    ]);
  });

  it('should create route handler', () => {
    const controller = {
      create: (options, meta) => {}
    };

    const handler = autoroute.createRouteHandler(controller, 'create');
    expect(handler).to.be.a('function');
  });

  it('should register the controller in the router', () => {
    const router = new Router();
    const controller = require('./mocks/test.js');

    autoroute.registerController(router, '/test', controller);

    const routes = router.stack.map(layer => ({
      path: layer.route.path,
      methods: layer.route.methods
    }));

    expect(routes).to.deep.equal([
      { path: '/test', methods: { head: true } },
      { path: '/test/:id', methods: { head: true } },
      { path: '/test', methods: { get: true } },
      { path: '/test/:id', methods: { get: true } },
      { path: '/test', methods: { post: true } },
      { path: '/test/:id', methods: { put: true } },
      { path: '/test/:id', methods: { patch: true } },
      { path: '/test/:id', methods: { delete: true } }
    ]);
  });

  it('should create a new router with routes ordered by length', () => {
    const router = autoroute.createRouter(path.join(__dirname, './mocks'));
    const routes = router.stack.map(layer => ({
      path: layer.route.path,
      methods: layer.route.methods
    }));
    // Should be sorted by the more
    expect(routes).to.deep.equal([
      { path: '/sub-path/sub-test', methods: { head: true } },
      { path: '/sub-path/sub-test/:id', methods: { head: true } },
      { path: '/sub-path/sub-test', methods: { get: true } },
      { path: '/sub-path/sub-test/:id', methods: { get: true } },
      { path: '/sub-path/sub-test', methods: { post: true } },
      { path: '/sub-path/sub-test/:id', methods: { put: true } },
      { path: '/sub-path/sub-test/:id', methods: { patch: true } },
      { path: '/sub-path/sub-test/:id', methods: { delete: true } },
      { path: '/', methods: { head: true } },
      { path: '/:id', methods: { head: true } },
      { path: '/', methods: { get: true } },
      { path: '/:id', methods: { get: true } },
      { path: '/', methods: { post: true } },
      { path: '/:id', methods: { put: true } },
      { path: '/:id', methods: { patch: true } },
      { path: '/:id', methods: { delete: true } },
      { path: '/test', methods: { head: true } },
      { path: '/test/:id', methods: { head: true } },
      { path: '/test', methods: { get: true } },
      { path: '/test/:id', methods: { get: true } },
      { path: '/test', methods: { post: true } },
      { path: '/test/:id', methods: { put: true } },
      { path: '/test/:id', methods: { patch: true } },
      { path: '/test/:id', methods: { delete: true } }
    ]);
  });
});
