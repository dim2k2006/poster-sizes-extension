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
  width: 0,
  height: 0,
  link: '',
});

const getInitialValue = () => range(4).map(genItem);

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    const sdkValue = props.sdk.field.getValue();
    const initialValue = getInitialValue();
    const value = sdkValue.length === 0 ? initialValue : sdkValue;

    this.state = { value };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();
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
                    <Option value="50x70">50x70</Option>
                    <Option value="40x50">40x50</Option>
                    <Option value="30x40">30x40</Option>
                    <Option value="21x30">21x30</Option>
                    <Option value="70x50">70x50</Option>
                    <Option value="50x40">50x40</Option>
                    <Option value="40x30">40x30</Option>
                    <Option value="30x21">30x21</Option>
                    <Option value="30x30">30x30</Option>
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
