import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import get from 'lodash/get';
import range from 'lodash/range';
import toNumber from 'lodash/toNumber';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, SelectField, Option } from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import './index.css';

const parseSize = (size) => size.split('x');

const genItem = () => ({
  id: uuidv4(),
  width: 50,
  height: 70,
  link: '',
});

const getInitialValue = (length = 4) => range(length).map(genItem);

const initialCount = {
  landscape: 4,
  portrait: 4,
  square: 2,
};

const getInitialCount = (orientation) => {
  const count = initialCount[orientation];

  if (!count) throw new Error('Invalid orientation type!');

  return count;
};

const sizes = {
  landscape: {
    0: { width: 70, height: 50 },
    1: { width: 50, height: 40 },
    2: { width: 40, height: 30 },
    3: { width: 30, height: 21 },
  },
  portrait: {
    0: { width: 50, height: 70 },
    1: { width: 40, height: 50 },
    2: { width: 30, height: 40 },
    3: { width: 21, height: 30 },
  },
  square: {
    0: { width: 50, height: 50 },
    1: { width: 30, height: 30 },
  },
}

const getSize = (orientation, idx) => {
  const sizesMap = sizes[orientation];

  if (!sizesMap) throw new Error('Invalid orientation type!');

  const size = sizesMap[idx];

  if (!size) throw new Error('Invalid size index!');

  return size;
};

const options = [
  { orientation: 'portrait', width: 50, height: 70 },
  { orientation: 'portrait', width: 40, height: 50 },
  { orientation: 'portrait', width: 30, height: 40 },
  { orientation: 'portrait', width: 21, height: 30 },

  { orientation: 'landscape', width: 70, height: 50 },
  { orientation: 'landscape', width: 50, height: 40 },
  { orientation: 'landscape', width: 40, height: 30 },
  { orientation: 'landscape', width: 30, height: 21 },

  { orientation: 'square', width: 50, height: 50 },
  { orientation: 'square', width: 30, height: 30 },
];

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    const sdkValue = props.sdk.field.getValue();
    const initialValue = getInitialValue();
    const value = sdkValue ? sdkValue : initialValue;
    const orientation = 'landscape';

    this.state = { value, orientation };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    const orientationField = this.props.sdk.entry.fields.orientation;

    orientationField.onValueChanged((orientation = 'landscape') => {
      this.setState((prevState) => {
        const length = getInitialCount(orientation);

        const newValue = getInitialValue(length)
          .map((value, idx) => {
              const size = getSize(orientation, idx);

              return { ...value, width: size.width, height: size.height };
            });

        return { ...prevState, value: newValue, orientation };
      });
    });
  }

  onSave = (value) => this.props.sdk.field.setValue(value);

  onExternalChange = (externalValue) => {
    this.setState((prevState) => ({
      value: externalValue ? externalValue : prevState.value,
    }));
  };

  onChange = (id, type, value) => {
    this.setState((prevState) => {
      const newValue = prevState.value
        .map((item) => {
          if (item.id !== id) return item;

          return {
            ...item,
            [type]: value,
          };
        });

      this.onSave(newValue);

      return { value: newValue };
    });
  };

  onChangeSize = (id, value) => {
    const size = parseSize(value);

    const width = toNumber(size[0]);
    const height = toNumber(size[1]);

    this.onChange(id, 'width', width);
    this.onChange(id, 'height', height);
  }

  onAddItem = () => {
    const item = genItem();

    this.setState((prevState) => {
      const value = [...prevState.value, item];

      this.onSave(value);

      return { value };
    })
  };

  onRemoveItem = (id) => {
    this.setState((prevState) => {
      const value = prevState.value
        .filter((item) => item.id !== id);

      this.onSave(value);

      return { value };
    })
  };

  render() {
    const value = get(this.state, 'value', []);
    const orientation = get(this.state, 'orientation');

    return (
      <div className="App">
        <div className="App__content">
          {
            value.map((item) => (
              <div key={item.id} className="App__item">
                <div className="App__field">
                  <SelectField
                    id={item.id}
                    name={item.id}
                    labelText="Size"
                    value={`${item.width}x${item.height}`}
                    onChange={(event) => this.onChangeSize(item.id, event.target.value)}
                  >
                    {
                      options
                        .filter((option) => option.orientation === orientation)
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
                    onChange={(event) => this.onChange(item.id, 'link', event.target.value)}
                  />
                </div>

                <div className="App__remove">
                  <Button buttonType="negative" icon="Close" onClick={() => this.onRemoveItem(item.id)} />
                </div>
              </div>
            ))
          }
        </div>

        <div className="App__footer">
          <Button buttonType="primary" onClick={this.onAddItem}>Add size</Button>
        </div>
      </div>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
