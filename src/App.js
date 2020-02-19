import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';
import TableInfo from './table-info';

import './css/plugin-layout.css';

const propTypes = {
  showDialog: PropTypes.bool
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showDialog: props.showDialog || false,
    };
    this.dtable = new DTable();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  } 

  async initPluginDTableData() {
    if (window.app === undefined) {
      // local develop
      window.app = {};
      await this.dtable.init(window.dtablePluginConfig);
      let res = await this.initPluginRelatedUsers(this.dtable.dtableStore);
      window.app.collaborators = res.data.user_list;
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
      this.dtable.subscribe('remote-data-changed', () => { this.onDTableChanged(); });
      await this.dtable.syncWithServer();
      this.resetData();
    } else {
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
      let res = await this.initPluginRelatedUsers(this.dtable.dtableStore);
      window.app.collaborators = res.data.user_list;
      this.dtable.subscribe('remote-data-changed', () => { this.onDTableChanged(); });
      await this.dtable.init(window.dtablePluginConfig);
      this.resetData();
    }
  }
  
  async initPluginRelatedUsers(dtableStore) {
    return dtableStore.dtableAPI.getTableRelatedUsers();
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  resetData = () => {
    this.setState({
      isLoading: false,
      showDialog: true
    });
  }

  onPluginToggle = () => {
    this.setState({showDialog: false});
  }

  render() {
    let { isLoading, showDialog } = this.state;
    if (isLoading) {
      return '';
    }

    let { collaborators } = window.app;
    let dtableStore = this.dtable.dtableStore;
    let tables = dtableStore.value.tables;
    
    return (
      <Modal isOpen={showDialog} toggle={this.onPluginToggle} contentClassName="dtable-plugin plugin-container" size='lg'>
        <ModalHeader className="test-plugin-header" toggle={this.onPluginToggle}>{'插件'}</ModalHeader>
        <ModalBody className="test-plugin-content">
          <TableInfo tables={tables} collaborators={collaborators} />
        </ModalBody>
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;
