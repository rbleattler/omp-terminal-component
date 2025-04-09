# Instructions

## Document Everything

Whenever changes are made to the codebase, ensure that the README, copilot-instructions.md, and any other relevant documentation are updated to reflect the changes.

## Tasks for Agents

When working through agent requests, before implementing anything, write a detailed implementation plan with technical details, relationship diagrams (in mermaidjs syntax), and user stories in the `./tasks/<ID>` directory (where ID is a 3 digit number starting with 001).

1. Create an `implementation.md` file with all the implementation details
1. Create a `user_stories.md` file with all the user stories.
1. Create a `commit_message.md` file with a detailed commit message that describes the changes made, why they were made, and any relevant information that will help future developers understand the changes.
1. Create a `pull_request.md` file with a detailed description of the changes made, why they were made, and any relevant information that will help future developers understand the changes. This should include a link to the `implementation.md` file and any relevant user stories.
1. Always check that each of these files is present and up to date before continuing with work on the task.

### Implementation Plan

The implementation plan should include the following sections:

- **Overview**: A brief description of the task and its purpose.
- **Implementation Plan**: A detailed plan of how the task will be implemented, including any necessary code changes, database schema updates, and API modifications.
- **User Stories**: A list of user stories that describe how the task will be used by end-users. Each user story should include a description, acceptance criteria, and any relevant screenshots or diagrams.
- **Technical Details**: Any technical details that are relevant to the implementation, such as libraries or frameworks that will be used, and any potential challenges or considerations.
- **Relationship Diagrams**: Any relationship diagrams that are relevant to the implementation, such as class diagrams, sequence diagrams, or entity-relationship diagrams. These should be written in mermaidjs syntax and included in the `implementation.md` file.
- **Code Changes**: A list of code changes that will be made, including any new files that will be created and any existing files that will be modified. Each code change should include a brief description of what it does and why it is necessary.
- **Database Schema Updates**: A list of any database schema updates that will be made, including any new tables or columns that will be added, and any existing tables or columns that will be modified. Each database schema update should include a brief description of what it does and why it is necessary.
- **API Modifications**: A list of any API modifications that will be made, including any new endpoints that will be added, and any existing endpoints that will be modified. Each API modification should include a brief description of what it does and why it is necessary.
- **Testing Plan**: A plan for how the changes will be tested, including any unit tests, integration tests, or end-to-end tests that will be created. Each test should include a brief description of what it does and why it is necessary.

These instructions will be used by future agent calls should we run out of tokens, and for writing documentation, and future improvements to the codebase. The goal is to ensure that all changes are well-documented and that the codebase is easy to understand and maintain.

## User Stories

Each user story should include the following sections:

- **Title**: A brief title that describes the user story.
- **As a**: A description of the user or role that will be using the feature.
- **I want**: A description of the feature or functionality that the user wants.
- **So that**: A description of the benefit or outcome that the user will achieve by using the feature.
- **Acceptance Criteria**: A list of criteria that must be met for the user story to be considered complete. This should include any specific functionality, performance, or usability requirements.
- **Screenshots/Diagrams**: Any relevant screenshots or diagrams that help to illustrate the user story. This could include wireframes, flowcharts, or other visual representations of the feature.
- **Notes**: Any additional notes or comments that are relevant to the user story. This could include links to related user stories, technical details, or other information that may be helpful for future developers.
