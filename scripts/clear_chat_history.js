import { supabaseAdmin } from '../server/supabaseAdmin.js';

async function clearChatHistory() {
    console.log("🧹 Starting Production Cleanup: Deleting all messages and nudges...");

    try {
        // 1. Delete Messages
        const { count: msgCount, error: msgError } = await supabaseAdmin
            .from('messages')
            .delete({ count: 'exact' })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete ALL

        if (msgError) throw msgError;
        console.log(`✅ Deleted ${msgCount || 0} messages.`);

        // 2. Delete Nudges (Chat requests)
        const { count: nudgeCount, error: nudgeError } = await supabaseAdmin
            .from('nudges')
            .delete({ count: 'exact' })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete ALL

        if (nudgeError) throw nudgeError;
        console.log(`✅ Deleted ${nudgeCount || 0} nudges.`);

        console.log("✨ Chat history cleared successfully for production!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error clearing chat history:", err);
        process.exit(1);
    }
}

clearChatHistory();
