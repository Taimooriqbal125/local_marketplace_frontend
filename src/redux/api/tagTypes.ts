// src/redux/api/tagTypes.js

export const TAG_TYPES = [
  'Listing',
  'Listings',

  'Order',
  'Orders',

  'Category',
  'Categories',

  'User',
  'Users',

  'Review',
  'Reviews',

  'Profile',
  'Profiles',
  'ProfileLocation',

  'City',
  'Cities',

  'Category',
  'Categories',
  'ParentCategories',
  'CategoryTree',
  'SubCategories',

  'Notification',
  'Notifications',

  'DeviceToken',
  'DeviceTokens',
] as const;

export type TagType = (typeof TAG_TYPES)[number];
