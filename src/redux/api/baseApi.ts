import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/app/axios/axiosBaseQuery';
import { TAG_TYPES } from './tagTypes';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: TAG_TYPES as unknown as string[], // Cast required for compatibility with RTK Query internal types
  endpoints: () => ({}),
});
