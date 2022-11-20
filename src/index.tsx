import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import get from 'lodash/get';
import range from 'lodash/range';
import toNumber from 'lodash/toNumber';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, SelectField, Option } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import './index.css';

interface SizeItem {
  id: string,
  width: number,
  height: number,
  link: string,
}

interface SizeShape {
  width: number,
  height: number,
}

type Orientation = 'portrait' | 'landscape' | 'square';

const parseSize = (size: string) => size.split('x');

const genItem = (): SizeItem => ({
  id: uuidv4(),
  width: 50,
  height: 70,
  link: '',
});

const getInitialSizes = (length = 4): SizeItem[] => range(length).map(genItem);

const initialCount = {
  landscape: 4,
  portrait: 4,
  square: 2,
};

const getInitialCount = (orientation: Orientation) => {
  const count = initialCount[orientation];

  if (!count) throw new Error('Invalid orientation type!');

  return count;
};

interface Sizes {
  landscape: {
    [key: number]: SizeShape
  },
  portrait: {
    [key: number]: SizeShape
  },
  square: {
    [key: number]: SizeShape
  },
}

const sizes: Sizes = {
  landscape: {
    0: { width: 70, height: 50 },
    1: { width: 50, height: 40 },
    2: { width: 40, height: 30 },
    3: { width: 30, height: 21 },
    4: { width: 14.8, height: 10.5 },
  },
  portrait: {
    0: { width: 50, height: 70 },
    1: { width: 40, height: 50 },
    2: { width: 30, height: 40 },
    3: { width: 21, height: 30 },
    4: { width: 10.5, height: 14.8 },
    5: { width: 38, height: 57 },
    6: { width: 38, height: 52 },
    7: { width: 29.7, height: 42 },
    8: { width: 10, height: 15 },
  },
  square: {
    0: { width: 50, height: 50 },
    1: { width: 23, height: 23 },
  },
}

const getSize = (orientation: Orientation, idx: number) => {
  const sizesMap = sizes[orientation];

  if (!sizesMap) throw new Error('Invalid orientation type!');

  const size = sizesMap[idx];

  if (!size) throw new Error('Invalid size index!');

  return size;
};

interface OptionType extends SizeShape {
  orientation: Orientation,
}

const options: OptionType[] = [
  { orientation: 'portrait', width: 50, height: 70 },
  { orientation: 'portrait', width: 40, height: 50 },
  { orientation: 'portrait', width: 38, height: 57 },
  { orientation: 'portrait', width: 38, height: 52 },
  { orientation: 'portrait', width: 30, height: 40 },
  { orientation: 'portrait', width: 29.7, height: 42 },
  { orientation: 'portrait', width: 21, height: 30 },
  { orientation: 'portrait', width: 10.5, height: 14.8 },
  { orientation: 'portrait', width: 10, height: 15 },

  { orientation: 'landscape', width: 70, height: 50 },
  { orientation: 'landscape', width: 50, height: 40 },
  { orientation: 'landscape', width: 40, height: 30 },
  { orientation: 'landscape', width: 30, height: 21 },
  { orientation: 'landscape', width: 14.8, height: 10.5 },

  { orientation: 'square', width: 50, height: 50 },
  { orientation: 'square', width: 23, height: 23 },
];

const defaultOrientation: Orientation = 'portrait';

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface Value {
  sizes: SizeItem[],
  orientation: Orientation,
}

const App: React.FC<AppProps> = ({ sdk }) => {
  const sdkValue = sdk.field.getValue();
  const initialSizes = getInitialSizes();
  const initialValue = sdkValue ? sdkValue : { sizes: initialSizes, orientation: defaultOrientation };

  const [value, setValue] = useState<Value>(initialValue);

  const onSave = useCallback((newValue: Value) => {
    sdk.field.setValue(newValue);

    setValue(newValue);
  }, [sdk.field]);

  const onChange = (id: string, prop: string, val: number) => {
    const sizes = value.sizes
      .map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          [prop]: val,
        };
      });

    const newValue = { sizes, orientation: value.orientation };

    onSave(newValue);
  };

  const onChangeSize = (id: string, val: string) => {
    const size = parseSize(val);

    const width = toNumber(size[0]);
    const height = toNumber(size[1]);

    const sizes = value.sizes
      .map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          width,
          height,
        };
      });

    const newValue = { sizes, orientation: value.orientation };

    onSave(newValue);
  }

  const onAddItem = () => {
    const item = genItem();

    const sizes = [...value.sizes, item];

    const newValue = { sizes, orientation: value.orientation };

    onSave(newValue);
  };

  const onRemoveItem = (id: string) => {
    const sizes = value.sizes
      .filter((item) => item.id !== id);

    const newValue = { sizes, orientation: value.orientation };

    onSave(newValue);
  };

  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => {
      sdk.window.stopAutoResizer();
    }
  }, [sdk.window]);

  useEffect(() => {
    const orientationField = sdk.entry.fields.orientation;

    const detachValueChangeHandler = orientationField.onValueChanged((orientation: Orientation = defaultOrientation) => {
      if (value.orientation === orientation) return; // prevent initial change

      const length = getInitialCount(orientation);

      const sizes = getInitialSizes(length)
        .map((value, idx) => {
          const size = getSize(orientation, idx);

          return { ...value, width: size.width, height: size.height };
        });

      const newValue = { sizes, orientation };

      onSave(newValue);
    });

    return () => detachValueChangeHandler();
  }, [onSave, sdk.entry.fields.orientation, value.orientation]);

  return (
    <div className="App">
      <div className="App__content">
        {
          value.sizes.map((item) => (
            <div key={item.id} className="App__item">
              <div className="App__field">
                <SelectField
                  id={item.id}
                  name={item.id}
                  labelText="Size"
                  value={`${item.width}x${item.height}`}
                  onChange={(event) => onChangeSize(item.id, get(event, 'target.value'))}
                >
                  {
                    options
                      .filter((option) => option.orientation === value.orientation)
                      .map((option) => {
                        const optionValue = `${option.width}x${option.height}`;

                        return (
                          <Option key={optionValue} value={optionValue}>{optionValue}</Option>
                        )
                      })
                  }
                </SelectField>
              </div>

              <div className="App__field">
                <TextField
                  id={item.id}
                  name={item.id}
                  labelText="Link"
                  value={item.link}
                  onChange={(event) => onChange(item.id, 'link', get(event, 'target.value'))}
                />
              </div>

              <div className="App__remove">
                <Button buttonType="negative" icon="Close" onClick={() => onRemoveItem(item.id)} />
              </div>
            </div>
          ))
        }
      </div>

      <div className="App__footer">
        <Button buttonType="primary" onClick={onAddItem}>Add size</Button>
      </div>
    </div>
  );
};

export default App;

init((sdk: FieldExtensionSDK) => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});
