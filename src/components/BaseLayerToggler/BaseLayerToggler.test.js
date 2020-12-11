/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';
import OLMap from 'ol/Map';
import { Layer } from 'mobility-toolbox-js/ol';
import renderer from 'react-test-renderer';
import BaseLayerToggler from './BaseLayerToggler';
import LayerService from '../../LayerService';

configure({ adapter: new Adapter() });

const shallowComp = (layers, props) => {
  const map = new OLMap({});
  const layerService = new LayerService(layers);
  return shallow(
    <BaseLayerToggler
      layerService={layerService}
      map={map}
      {...(props || {})}
    />,
  );
};
const mountComp = (layers, props) => {
  const map = new OLMap({});
  const layerService = new LayerService(layers);
  return mount(
    <BaseLayerToggler
      layerService={layerService}
      map={map}
      {...(props || {})}
    />,
  );
};

const expectSnapshot = (layers, props) => {
  const map = new OLMap({});
  const layerService = new LayerService(layers);
  const component = renderer.create(
    <BaseLayerToggler
      layerService={layerService}
      map={map}
      {...(props || {})}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
};

describe('BaseLayerToggler', () => {
  let layers;

  beforeEach(() => {
    layers = [
      new Layer({
        name: 'bl1',
        isBaseLayer: true,
      }),
      new Layer({
        name: 'bl2',
        isBaseLayer: true,
        visible: false,
      }),
      new Layer({
        name: 'bl3',
        isBaseLayer: true,
        visible: false,
      }),
    ];
  });
  describe('matches snapshots', () => {
    test('using default properties.', () => {
      expectSnapshot(layers);
    });
  });

  test('initialize correctly the state', () => {
    const wrapper = shallowComp(layers);
    const comp = wrapper.instance();
    expect(comp.state.idx).toBe(1);
    expect(comp.state.layers.length).toBe(3);
    expect(comp.state.layerVisible).toBe(comp.state.layers[0]);
  });

  test('goes forward through all available layer except the current layer displayed on the map.', () => {
    const wrapper = shallowComp(layers);
    const comp = wrapper.instance();
    const layerVisible = comp.state.layers[0];
    expect(comp.state.layers.length).toBe(3);
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(1);

    wrapper.find('.rs-base-layer-next').simulate('click');
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(2);

    // Layer at index 0 is displayed on the map so we must ignore it
    wrapper.find('.rs-base-layer-next').simulate('click');
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(1);
  });

  test('goes backward through all available layer except the current layer displayed on the map.', () => {
    const wrapper = shallowComp(layers);
    const comp = wrapper.instance();
    const layerVisible = comp.state.layers[0];
    expect(comp.state.layers.length).toBe(3);
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(1);

    wrapper.find('.rs-base-layer-previous').simulate('click');
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(2);

    // Layer at index 0 is displayed on the map so we must ignore it
    wrapper.find('.rs-base-layer-previous').simulate('click');
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(1);
  });

  test('displays always a baseLayer on the map.', () => {
    const wrapper = shallowComp(layers);
    const comp = wrapper.instance();
    const layerVisible = comp.state.layers[0];
    expect(comp.state.layers.length).toBe(3);
    expect(comp.state.layerVisible).toBe(layerVisible);
    expect(comp.state.idx).toBe(1);
    comp.state.layers[0].setVisible(false);

    expect(comp.state.layers.length).toBe(3);
    expect(comp.state.layerVisible).toBe(comp.state.layers[1]);
    expect(comp.state.idx).toBe(0);
  });

  test('display on the map the layer clicked', () => {
    const wrapper = mountComp(layers);
    const comp = wrapper.instance();
    expect(comp.state.layers.length).toBe(3);
    expect(comp.state.layers[0].visible).toBe(true);
    wrapper.find('.rs-base-layer-toggle-button').simulate('click');
    wrapper.update();
    expect(comp.state.layers[0].visible).toBe(false);
    expect(comp.state.layers[1].visible).toBe(true);
    expect(comp.state.layerVisible).toBe(comp.state.layers[1]);
    expect(comp.state.idx).toBe(0); // Toggle
  });

  test('hide baseLayerToggler if only one baselayer', () => {
    const wrapper = mountComp([layers[0]]);
    expect(wrapper.find('.rs-base-layer-item').exists()).toBe(false);
  });

  test('should use children', () => {
    const wrapper = shallowComp(layers, {
      prevButtonContent: 'prev',
      nextButtonContent: 'next',
    });
    expect(wrapper.find('.rs-base-layer-item').exists()).toBe(false);

    const next = wrapper.find('.rs-base-layer-next').text();
    const prev = wrapper.find('.rs-base-layer-previous').text();

    expect(next).toBe('next');
    expect(prev).toBe('prev');
  });
});
