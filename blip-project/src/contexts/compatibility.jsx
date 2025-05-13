import { UseStateContext, DiscordContext } from './AppContext';

// Re-export contexts for backward compatibility
export { UseStateContext, DiscordContext as Call, DiscordContext };
 
// Re-export hooks for better future usage
export { useAppState, useDiscord, useCall } from './AppContext'; 