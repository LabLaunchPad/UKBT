import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/tina/islands';

export const prerender = false;
export const POST = experimental_createIslandRoute(islands);
