
import { Task, ColumnData } from './types';

export const INITIAL_DATA: ColumnData[] = [
  {
    id: 'todo',
    title: 'To-do',
    tasks: [
      {
        id: 'task-1',
        title: 'Design Login Screen',
        description: 'Create UI/UX mockups for the login and sign up screens.',
        priority: 'High priority',
        labels: [
          { id: 'l1', name: 'Design', color: '#8B5CF6' },
          { id: 'l2', name: 'UI/UX', color: '#0EA5E9' }
        ],
        dueDate: '29.09.25',
        assignees: ['https://picsum.photos/seed/1/40', 'https://picsum.photos/seed/2/40', 'https://picsum.photos/seed/3/40'],
        statusChip: { id: 'sf1', name: 'Risk of delay', color: '#0EA5E9' },
        attachments: 6,
        checklist: [
          { id: 'c1', text: 'Create User Flow', completed: true },
          { id: 'c2', text: 'Wireframe Login', completed: false },
          { id: 'c3', text: 'High Fidelity UI', completed: false }
        ],
        comments: [
          { id: 'm1', user: { name: 'Chandrika M', avatar: 'https://picsum.photos/seed/user/64' }, text: 'We need this by Friday.', timestamp: '2h ago' }
        ]
      },
      {
        id: 'task-2',
        title: 'Write API Documentation',
        description: 'Document endpoints for user authentication.',
        priority: 'Medium priority',
        labels: [
          { id: 'l3', name: 'Development', color: '#10B981' }
        ],
        dueDate: '10.10.25',
        assignees: ['https://picsum.photos/seed/4/40', 'https://picsum.photos/seed/5/40'],
        attachments: 2,
        checklist: [{ id: 'c4', text: 'Write Auth section', completed: true }],
        comments: []
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'In progress',
    tasks: [
      {
        id: 'task-3',
        title: 'Create Brand Style Guide',
        description: 'Document endpoints for user authentication.',
        priority: 'Low priority',
        labels: [
          { id: 'l1', name: 'Design', color: '#8B5CF6' }
        ],
        dueDate: '10.10.25',
        assignees: ['https://picsum.photos/seed/6/40', 'https://picsum.photos/seed/7/40'],
        attachments: 2,
        checklist: [{ id: 'c5', text: 'Select Typography', completed: true }],
        comments: []
      },
      {
        id: 'task-4',
        title: 'Implement User Authentication',
        description: 'Backend service with OAuth2 and JWT support.',
        priority: 'High priority',
        labels: [
          { id: 'l3', name: 'Development', color: '#10B981' },
          { id: 'l4', name: 'Security', color: '#EF4444' }
        ],
        dueDate: '29.09.25',
        assignees: ['https://picsum.photos/seed/8/40', 'https://picsum.photos/seed/9/40', 'https://picsum.photos/seed/10/40'],
        statusChip: { id: 'sf2', name: 'Needs splitting', color: '#8B5CF6' },
        attachments: 6,
        checklist: [
          { id: 'c6', text: 'Setup OAuth', completed: false },
          { id: 'c7', text: 'JWT Implementation', completed: false },
          { id: 'c8', text: 'Database migrations', completed: false },
          { id: 'c9', text: 'Security review', completed: false }
        ],
        comments: []
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: 'task-6',
        title: 'Test Payment Gateway',
        description: 'Verify end-to-end transaction flow with sandbox account.',
        priority: 'High priority',
        labels: [
          { id: 'l3', name: 'Development', color: '#10B981' },
          { id: 'l5', name: 'Fintech', color: '#F59E0B' }
        ],
        dueDate: '29.09.25',
        assignees: ['https://picsum.photos/seed/11/40', 'https://picsum.photos/seed/12/40'],
        statusChip: { id: 'sf3', name: 'Overdue blocker', color: '#EF4444' },
        attachments: 6,
        checklist: [
          { id: 'c10', text: 'Stripe integration test', completed: true },
          { id: 'c11', text: 'Error handling', completed: true },
          { id: 'c12', text: 'Load testing', completed: false }
        ],
        comments: []
      }
    ]
  },
  {
    id: 'completed',
    title: 'Completed',
    tasks: [
      {
        id: 'task-8',
        title: 'Competitive Analysis PPT',
        description: 'Slides shared with stakeholders.',
        priority: 'Medium priority',
        labels: [
          { id: 'l6', name: 'Research', color: '#0EA5E9' }
        ],
        dueDate: '25.09.25',
        assignees: ['https://picsum.photos/seed/13/40', 'https://picsum.photos/seed/14/40'],
        attachments: 5,
        checklist: [
          { id: 'c13', text: 'Market research', completed: true },
          { id: 'c14', text: 'Slide deck design', completed: true }
        ],
        comments: []
      }
    ]
  }
];
