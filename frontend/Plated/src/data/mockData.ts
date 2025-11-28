import type { FeedPost, Conversation, Message, UserProfile, MockConfig, Comment } from '../types';

// Mock Configuration for testing without backend
export const mockConfig: MockConfig = {
  enabled: import.meta.env.DEV, // Enable mock mode in development
  features: {
    feed: true,
    messages: true,
    challenges: true,
    rewards: true,
    squads: true,
    leaderboards: true,
    market: true,
  },
};

// Mock Users
export const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'chef.maria@example.com',
    username: 'chef_maria',
    display_name: 'Maria Rodriguez',
    profile_pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    email: 'john.cook@example.com',
    username: 'john_cook',
    display_name: 'John Smith',
    profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    email: 'sarah.baker@example.com',
    username: 'sarah_baker',
    display_name: 'Sarah Johnson',
    profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    email: 'mike.chef@example.com',
    username: 'mike_chef',
    display_name: 'Mike Chen',
    profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
];

// Mock Feed Posts
export const mockFeedPosts: FeedPost[] = [
  {
    id: '1',
    user_id: '1',
    user: {
      username: 'chef_maria',
      display_name: 'Maria Rodriguez',
      profile_pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    title: 'Homemade Pasta Carbonara',
    description: 'Creamy, rich pasta carbonara made the traditional Italian way. This recipe has been passed down through generations in my family.',
    media_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop',
    media_type: 'image',
    recipe_data: {
      cooking_time: 30,
      difficulty: 'medium',
      servings: 4,
      ingredients: [
        '400g spaghetti',
        '200g pancetta',
        '4 large eggs',
        '100g pecorino cheese',
        'Black pepper',
        'Salt'
      ],
      instructions: [
        'Cook pasta according to package instructions',
        'Fry pancetta until crispy',
        'Mix eggs and cheese in a bowl',
        'Combine hot pasta with pancetta',
        'Add egg mixture and toss quickly',
        'Serve with extra cheese and pepper'
      ]
    },
    likes_count: 127,
    comments_count: 23,
    views_count: 892,
    is_liked: false,
    is_saved: false,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    user_id: '2',
    user: {
      username: 'john_cook',
      display_name: 'John Smith',
      profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    title: 'Perfect Chocolate Chip Cookies',
    description: 'Soft, chewy chocolate chip cookies that are perfect every time. The secret is in the brown butter!',
    media_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop',
    media_type: 'image',
    recipe_data: {
      cooking_time: 25,
      difficulty: 'easy',
      servings: 24,
      ingredients: [
        '2 1/4 cups all-purpose flour',
        '1 tsp baking soda',
        '1 tsp salt',
        '1 cup butter',
        '3/4 cup brown sugar',
        '1/4 cup white sugar',
        '2 large eggs',
        '2 tsp vanilla',
        '2 cups chocolate chips'
      ],
      instructions: [
        'Preheat oven to 375°F',
        'Brown the butter in a saucepan',
        'Mix dry ingredients in a bowl',
        'Cream butter with sugars',
        'Add eggs and vanilla',
        'Combine wet and dry ingredients',
        'Fold in chocolate chips',
        'Bake for 9-11 minutes'
      ]
    },
    likes_count: 89,
    comments_count: 15,
    views_count: 456,
    is_liked: true,
    is_saved: true,
    created_at: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    user_id: '3',
    user: {
      username: 'sarah_baker',
      display_name: 'Sarah Johnson',
      profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    title: 'Quick 15-Minute Stir Fry',
    description: 'Healthy vegetable stir fry that comes together in just 15 minutes. Perfect for busy weeknights!',
    media_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop',
    media_type: 'image',
    recipe_data: {
      cooking_time: 15,
      difficulty: 'easy',
      servings: 2,
      ingredients: [
        '2 cups mixed vegetables',
        '1 tbsp vegetable oil',
        '2 cloves garlic',
        '1 inch ginger',
        '2 tbsp soy sauce',
        '1 tbsp sesame oil',
        'Rice for serving'
      ],
      instructions: [
        'Heat oil in a large pan',
        'Add minced garlic and ginger',
        'Add vegetables and stir fry',
        'Add soy sauce and sesame oil',
        'Serve over rice'
      ]
    },
    likes_count: 67,
    comments_count: 8,
    views_count: 234,
    is_liked: false,
    is_saved: false,
    created_at: '2024-01-13T18:20:00Z'
  },
  {
    id: '4',
    user_id: '4',
    user: {
      username: 'mike_chef',
      display_name: 'Mike Chen',
      profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    title: 'Beef Wellington Tutorial',
    description: 'Step-by-step guide to making the perfect Beef Wellington. This impressive dish is easier than you think!',
    media_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
    media_type: 'video',
    recipe_data: {
      cooking_time: 120,
      difficulty: 'hard',
      servings: 6,
      ingredients: [
        '2 lb beef tenderloin',
        '1 lb puff pastry',
        '8 oz mushrooms',
        '2 shallots',
        '2 cloves garlic',
        '2 tbsp Dijon mustard',
        'Prosciutto slices',
        'Egg wash'
      ],
      instructions: [
        'Sear the beef tenderloin',
        'Make mushroom duxelles',
        'Wrap beef in prosciutto',
        'Roll in puff pastry',
        'Brush with egg wash',
        'Bake at 400°F for 25-30 minutes',
        'Rest before slicing'
      ]
    },
    likes_count: 203,
    comments_count: 45,
    views_count: 1234,
    is_liked: true,
    is_saved: false,
    created_at: '2024-01-12T12:15:00Z'
  },
  {
    id: '5',
    user_id: '1',
    user: {
      username: 'chef_maria',
      display_name: 'Maria Rodriguez',
      profile_pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    title: 'Mediterranean Quinoa Bowl',
    description: 'Fresh, healthy quinoa bowl with Mediterranean flavors. Perfect for meal prep!',
    media_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    media_type: 'image',
    recipe_data: {
      cooking_time: 20,
      difficulty: 'easy',
      servings: 4,
      ingredients: [
        '1 cup quinoa',
        'Cherry tomatoes',
        'Cucumber',
        'Red onion',
        'Kalamata olives',
        'Feta cheese',
        'Olive oil',
        'Lemon juice',
        'Fresh herbs'
      ],
      instructions: [
        'Cook quinoa according to package',
        'Chop all vegetables',
        'Mix quinoa with vegetables',
        'Add olives and feta',
        'Dress with olive oil and lemon',
        'Garnish with fresh herbs'
      ]
    },
    likes_count: 94,
    comments_count: 12,
    views_count: 567,
    is_liked: false,
    is_saved: true,
    created_at: '2024-01-11T09:30:00Z'
  }
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participant_ids: ['1', '2'],
    participants: [
      {
        id: '1',
        username: 'chef_maria',
        display_name: 'Maria Rodriguez',
        profile_pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '2',
        username: 'john_cook',
        display_name: 'John Smith',
        profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    ],
    last_message: {
      id: 'msg1',
      conversation_id: 'conv1',
      sender_id: '2',
      sender: {
        username: 'john_cook',
        display_name: 'John Smith',
        profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      content: 'Thanks for the pasta recipe! It was amazing!',
      created_at: '2024-01-15T14:30:00Z',
      is_read: true,
      status: 'read'
    },
    unread_count: 0,
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'conv2',
    participant_ids: ['1', '3'],
    participants: [
      {
        id: '1',
        username: 'chef_maria',
        display_name: 'Maria Rodriguez',
        profile_pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '3',
        username: 'sarah_baker',
        display_name: 'Sarah Johnson',
        profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ],
    last_message: {
      id: 'msg2',
      conversation_id: 'conv2',
      sender_id: '3',
      sender: {
        username: 'sarah_baker',
        display_name: 'Sarah Johnson',
        profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      content: 'Can you share your secret ingredient for the carbonara?',
      created_at: '2024-01-15T16:45:00Z',
      is_read: false,
      status: 'delivered'
    },
    unread_count: 1,
    updated_at: '2024-01-15T16:45:00Z'
  }
];

// Mock Messages for conversations
export const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversation_id: 'conv1',
    sender_id: '2',
    sender: {
      username: 'john_cook',
      display_name: 'John Smith',
      profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Thanks for the pasta recipe! It was amazing!',
    created_at: '2024-01-15T14:30:00Z',
    is_read: true,
    status: 'read'
  },
  {
    id: 'msg2',
    conversation_id: 'conv2',
    sender_id: '3',
    sender: {
      username: 'sarah_baker',
      display_name: 'Sarah Johnson',
      profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Can you share your secret ingredient for the carbonara?',
    created_at: '2024-01-15T16:45:00Z',
    is_read: false,
    status: 'delivered'
  }
];

// Mock Comments for posts
export const mockComments: Comment[] = [
  {
    id: 'comment1',
    post_id: '1',
    user_id: '2',
    user: {
      username: 'john_cook',
      display_name: 'John Smith',
      profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'This looks absolutely delicious! I\'ll definitely try this recipe this weekend.',
    created_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'comment2',
    post_id: '1',
    user_id: '3',
    user: {
      username: 'sarah_baker',
      display_name: 'Sarah Johnson',
      profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'The secret to perfect carbonara is using fresh eggs and good quality pancetta!',
    created_at: '2024-01-15T11:30:00Z'
  },
  {
    id: 'comment3',
    post_id: '1',
    user_id: '4',
    user: {
      username: 'mike_chef',
      display_name: 'Mike Chen',
      profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'I made this last night and it was incredible! My family loved it.',
    created_at: '2024-01-15T12:15:00Z'
  },
  {
    id: 'comment4',
    post_id: '2',
    user_id: '1',
    user: {
      username: 'chef_maria',
      display_name: 'Maria Rodriguez',
      profile_pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    content: 'These cookies are perfect! The brown butter really makes a difference.',
    created_at: '2024-01-14T16:00:00Z'
  },
  {
    id: 'comment5',
    post_id: '2',
    user_id: '3',
    user: {
      username: 'sarah_baker',
      display_name: 'Sarah Johnson',
      profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Can you share the exact baking time? I want to make sure they\'re perfectly soft.',
    created_at: '2024-01-14T16:30:00Z'
  },
  {
    id: 'comment6',
    post_id: '3',
    user_id: '2',
    user: {
      username: 'john_cook',
      display_name: 'John Smith',
      profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Love quick and healthy meals like this! Perfect for meal prep.',
    created_at: '2024-01-13T19:00:00Z'
  }
];

// Mock User Profile (current user)
export const mockCurrentUser: UserProfile = {
  id: 'current_user',
  email: 'test@example.com',
  username: 'test_user',
  display_name: 'Test User',
  profile_pic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
};
