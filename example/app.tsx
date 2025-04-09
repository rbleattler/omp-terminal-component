import ReactDOM from 'react-dom/client';
import Terminal from '../src/Terminal';
import Prompt from '../src/components/prompt';
import SegmentExample from './segmentExample';
import { MockProvider } from '../src/mocks/mockProvider';
import * as omp from '@rbleattler/omp-ts-typegen';

const App = () => {
  // Create a sample oh-my-posh config
  const sampleConfig: omp.Config = {
    "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
    "upgrade": {
      "notice": true,
      "interval": "12h",
      "auto": true,
      "source": "cdn"
    },
    "console_title_template": "{{ .Folder }}",
    "shell_integration": true,
    "patch_pwsh_bleed": false,
    "blocks": [
      {
        "type": "prompt",
        "alignment": "left",
        "segments": [
          {
            "properties": {
              "macos": "\uf179 ",
              "postfix": " ",
              "ubuntu": "\uf31b ",
              "windows": "\ue62a "
            },
            "background": "#fff",
            "foreground": "#000",
            "leading_diamond": "\ue0b6",
            "type": "os",
            "style": "diamond"
          },
          {
            "background": "#000",
            "foreground": "#fff",
            "leading_diamond": "<parentBackground,parentForeground>\ue0b0</>",
            "type": "shell",
            "style": "diamond"
          },
          {

            "template": "\uf4bc CPU:{{ round .PhysicalPercentUsed .Precision }}% ",
            "foreground": "#000",
            "background": "#fff",
            "type": "sysinfo",
            "leading_diamond": "<parentBackground,parentForeground>\ue0b0</>",
            "trailing_diamond": "<parentBackground,parentForeground>\ue0b0</>",
            "style": "diamond"
          },
          {
            "template": " \uefc5 MEM: {{ (div ((sub .PhysicalTotalMemory .PhysicalFreeMemory)|float64) 1000000000.0) }}/{{ (div .PhysicalTotalMemory 1000000000.0) }} GB ",
            "trailing_diamond": "<parentBackground,parentForeground>\ue0b0</>",
            "background": "#000",
            "foreground": "#fff",
            "type": "sysinfo",
            "style": "diamond"
          },
          {
            "properties": {
              "style": "roundrock",
              "threshold": 0
            },
            "leading_diamond": "<parentBackground,parentForeground> \uf0e7</>",
            "background": "#fff",
            "foreground": "#000",
            "type": "executiontime",
            "style": "diamond"
          },
          {
            "properties": {
              "branch_icon": "\ue725",
              "fetch_stash_count": true,
              "fetch_status": true,
              "fetch_upstream_icon": true,
              "fetch_worktree_count": true,
              "template": "{{ .UpstreamIcon }}{{ .HEAD }}{{ .BranchStatus }}{{ if .Working.Changed }}\uf044{{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }}|{{ end }}{{ if .Staging.Changed }}\uf046{{ .Staging.String }}{{ end }}{{ if gt .StashCount 0 }}\ueb4b{{ .StashCount }}{{ end }}"
            },
            "background": "#000",
            "foreground": "#fff",
            "type": "git",
            "style": "plain"
          },
          {
            "template": "{{ if .Segments.Git.BranchStatus }}<#000,transparent>\ue0b4</>{{ else }}<#fff,transparent>\ue0b4</>{{ end }}",
            "type": "text",
            "style": "diamond"
          }
        ],
        "newline": true
      },
      {
        "type": "prompt",
        "alignment": "right",
        "segments": [
          {
            "type": "wakatime",
            "style": "diamond",
            "leading_diamond": "\ue0b6",
            "trailing_diamond": "\ue0b4",
            "foreground": "#000",
            "background": "#fff",

            "properties": {
              "http_timeout": 500,
              "url": "https://wakapi.coasttech.org/api/compat/wakatime/v1/users/current/summaries?start=today&end=today&api_key={{ .Env.WAKAPI_API_KEY }}"
            }
          }
        ]
      },
      {
        "type": "prompt",
        "alignment": "left",
        "segments": [
          {
            "properties": {
              "text": "\u256d\u2500"
            },
            "type": "text",
            "style": "plain"
          },
          {
            "properties": {
              "postfix": "\u232a",
              "prefix": "\uf017",
              "time_format": " 15:04:05 "
            },
            "type": "time",
            "style": "plain"
          },
          {
            "properties": {
              "prefix": "",
              "root_icon": "\ue5ff"
            },
            "type": "root",
            "style": "plain"
          },
          {
            "properties": {
              "enable_hyperlink": true,
              "folder_icon": "\uf07b",
              "folder_separator_icon": " \ueab6",
              "home_icon": "\ueb06",
              "style": "folder"
            },
            "type": "path",
            "style": "plain"
          }
        ],
        "newline": true
      },
      {
        "type": "prompt",
        "alignment": "left",
        "segments": [
          {
            "properties": {
              "always_enabled": true,
              "prefix": "",
              "template": "\u2570\u2500"
            },
            "type": "text",
            "style": "plain"
          }
        ],
        "newline": true
      }
    ],

    "version": 3
  }
  ;

  // Create a sample prompt with the config
  const samplePrompt = new Prompt({
    config: sampleConfig,
    cursor: 0,
  });
  // Sample custom mock data to demonstrate segment handling
  const customMockData = {
    git: {
      branch: 'feature/dynamic-segments',
      isGitRepo: true,
      status: {
        working: { changed: true, string: '3' },
        staging: { changed: true, string: '2' }
      },
      stashCount: 4
    },
    path: {
      pwd: '/projects/omp-terminal-react-component',
      Location: 'omp-terminal-react-component'
    },
    env: {
      HOME: '/home/user'
    },
    time: {
      now: new Date()
    },
    system: {
      cpu: {
        physicalPercentUsed: 22.5,
        precision: 1
      },
      memory: {
        physicalTotalMemory: 16000000000,
        physicalFreeMemory: 8000000000
      }
    }
  };

  // Fix TypeScript type compatibility for exampleSegments
  const exampleSegments: omp.Segment[] = [
    {
      type: 'git',
      foreground: '#ffffff',
      background: '#007acc',
      properties: {
        branch_icon: '\ue725',
        fetch_status: true,
        fetch_stash_count: true
      },
      style: 'plain' // Ensure style is explicitly defined
    },
    {
      type: 'path',
      foreground: '#000000',
      background: '#ffcc00',
      style: 'diamond',
      properties: {
        style: 'folder',
        max_depth: 3
      }
    },
    {
      type: 'time',
      foreground: '#ffffff',
      background: '#444444',
      properties: {
        time_format: '15:04:05'
      },
      style: 'plain' // Ensure style is explicitly defined
    },
    {
      type: 'sysinfo',
      foreground: '#000000',
      background: '#a3d6e3',
      properties: {
        template: '\uf4bc CPU:{{ round .PhysicalPercentUsed .Precision }}% | \uefc5 MEM: {{ (div ((sub .PhysicalTotalMemory .PhysicalFreeMemory)|float64) 1000000000.0) }}/{{ (div .PhysicalTotalMemory 1000000000.0) }} GB'
      },
      style: 'plain' // Ensure style is explicitly defined
    }
  ];

  return (
    <div className="container">
      <h1>OMP Terminal Component Example</h1>

      <h2>Full Terminal Component</h2>
      <Terminal
        prompt={samplePrompt}
        title="Example Terminal"
        os="windows"
      />

      <h2>Dynamic Segment Handlers Demo</h2>
      <p>This demonstrates the dynamically generated segment handlers processing segments independently from the terminal component.</p>

      <MockProvider mockData={customMockData}>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
          <SegmentExample
            segments={exampleSegments}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          />
        </div>
      </MockProvider>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>About Dynamic TypeScript Code Generation</h3>
        <p>
          This example demonstrates the dynamic TypeScript code generation system that generates segment handlers from the Oh My Posh golang source at build time.
          The segment handlers process each segment according to its type, applying the same logic as the original Oh My Posh implementation.
        </p>
        <p>
          See <a href="https://github.com/user/repo/blob/main/docs/code-generation.md">documentation</a> for more details on how this works.
        </p>
      </div>
    </div>
  );
};

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
