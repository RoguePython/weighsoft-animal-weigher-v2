/**
 * Redirect to Batches Tab
 * 
 * Default route redirects to batches tab.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/batches" />;
}

