import React from 'react';
import { Actions, Manager, SideLink } from "@twilio/flex-ui";
import {setMyPageState} from '../../states';
import { MyIcon, MyIconActive } from "./MyIcon";
import {namespace} from '../../states';

export default class SidebarMyButton extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
    const manager = Manager.getInstance();
		const {store} = manager;
    store.dispatch( setMyPageState('PAGE_ACTIVE') );
		Actions.invokeAction("NavigateToView", { viewName: "my-page" });

		// suppose we want to use our Sync client
		const syncClient = store.getState()[namespace].appState.syncClient;
		syncClient.document('MyDocument')
		.then((document) => {
			console.log('Successfully opened a document. SID:', document.sid);
			document.on('updated', (event) => {
				console.log('Received an "updated" event: ', event);
			});
		})
		.catch((error) => {
			console.error('Unexpected error', error);
		});
	}

	render() {
		return (
			<SideLink
				{...this.props}
				icon={<MyIcon />}
				iconActive={<MyIconActive />}
				isActive={this.props.activeView === "my-page"}
				onClick={this.handleClick}
			>
				Custom Page Nav
			</SideLink>
		);
	}
}
