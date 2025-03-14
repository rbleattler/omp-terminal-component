import React, { Component } from 'react';
import TerminalProps from './components/terminalProps';
import './css/terminal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize, faWindowMaximize, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { faWindows, faApple } from '@fortawesome/free-brands-svg-icons';
// import Prompt from './components/prompt';
// import { Block } from '@rbleattler/omp-ts-typegen';

function controlButtons(os: string, toggleOs: (e: React.MouseEvent) => void) {
	// Change the order depending on the OS
	// Macos: Close, Minimize, Maximize
	// Windows: Minimize, Maximize, Close

	const osToggleButton = (
		<span className="terminal-control terminal-toggle" onClick={ toggleOs }>
			<FontAwesomeIcon
				icon={ os === 'macos' ? faWindows : faApple }
				title={ `Switch to ${os === 'macos' ? 'Windows' : 'macOS'}` }
			/>
		</span>
	);

	switch (os) {
		case 'macos':
			return (
				<>
					<span className="terminal-control terminal-close">
						<FontAwesomeIcon icon={ faWindowClose } />
					</span>
					<span className="terminal-control terminal-minimize">
						<FontAwesomeIcon icon={ faWindowMinimize } />
					</span>
					<span className="terminal-control terminal-maximize">
						<FontAwesomeIcon icon={ faWindowMaximize } />
					</span>
					{ osToggleButton }
				</>
			);
		case 'windows':
			return (
				<>
					{ osToggleButton }
					<span className="terminal-control terminal-minimize">
						<FontAwesomeIcon icon={ faWindowMinimize } />
					</span>
					<span className="terminal-control terminal-maximize">
						<FontAwesomeIcon icon={ faWindowMaximize } />
					</span>
					<span className="terminal-control terminal-close">
						<FontAwesomeIcon icon={ faWindowClose } />
					</span>
				</>
			);
		default:
			return (
				<>
					<span className="terminal-control terminal-close">
						<FontAwesomeIcon icon={ faWindowClose } />
					</span>
					<span className="terminal-control terminal-minimize">
						<FontAwesomeIcon icon={ faWindowMinimize } />
					</span>
					<span className="terminal-control terminal-maximize">
						<FontAwesomeIcon icon={ faWindowMaximize } />
					</span>
				</>
			);
	}
}

// A react component that looks like a terminal window
// It can be configured to look like it is running in macos/windows/linux, which affects the top bar (where the close/minimize/maximize buttons are)

// Terminal component
class Terminal extends Component<TerminalProps> {

	override state = {
		currentOs: this.props.os
	};

	// Constructor
	constructor(props: TerminalProps) {
		super(props);
	}

	toggleOs = (e: React.MouseEvent) => {
		// Stop propagation to prevent the click from affecting other elements
		e.stopPropagation();
		this.setState({
			currentOs: this.state.currentOs === 'macos' ? 'windows' : 'macos'
		});
	}

	// Render
	override render() {
		const os = this.state.currentOs;

		return (
			<div className="terminal">
				<div className="terminal-title">
					<span className={ `terminal-controls ${os}` }>
						{ controlButtons(os, this.toggleOs) }
					</span>
					<span className='title-text'>{ this.props.title }</span>
				</div>
				<div className="terminal-body">
					<div className="terminal-content">
						{/* Directly render the prompt component's output */ }
						{ this.props.prompt.render() }
					</div>
				</div>
			</div>
		);
	}
}

export default Terminal;