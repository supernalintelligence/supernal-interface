/**
 * Example: User Management with Supernal Interface
 * 
 * Demonstrates how to use @ToolProvider and @Tool decorators
 * with AI safety controls.
 */

import { Tool, ToolProvider } from '../src/decorators';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'deleted';
}

@ToolProvider({
  category: 'user-management',
  executionContext: 'api',
  tags: ['admin', 'users']
})
export class UserManagementProvider {
  
  // SAFE: Read-only operation - can be AI-enabled
  @Tool({ 
    aiEnabled: true,
    description: 'Get list of all users with optional filtering'
  })
  async getUserList(filters?: { status?: string; search?: string }): Promise<User[]> {
    // Implementation would fetch from database
    console.log('Fetching users with filters:', filters);
    return [];
  }
  
  // SAFE: Search operation - AI-enabled by default for safe operations
  @Tool({ 
    aiEnabled: true,
    examples: ['find user john', 'search for users', 'look up user by email']
  })
  async searchUsers(query: string): Promise<User[]> {
    console.log('Searching users:', query);
    return [];
  }
  
  // MODERATE: Create operation - test-only by default, can be AI-enabled
  @Tool({
    description: 'Create a new user account',
    // aiEnabled: false by default (test-only)
  })
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    console.log('Creating user:', userData);
    return { id: 'new-id', ...userData };
  }
  
  // MODERATE: Update operation - can be AI-enabled if desired
  @Tool({
    aiEnabled: true,
    requiresApproval: false,  // Override default approval for moderate operations
    description: 'Update user profile information'
  })
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    console.log('Updating user:', userId, updates);
    return { id: userId, name: 'Updated', email: 'updated@example.com', status: 'active' };
  }
  
  // DANGEROUS: Status change - requires approval even when AI-enabled
  @Tool({
    aiEnabled: true,
    // requiresApproval: true automatically inferred for dangerous operations
    description: 'Suspend a user account'
  })
  async suspendUser(userId: string, reason: string): Promise<User> {
    console.log('Suspending user:', userId, 'Reason:', reason);
    return { id: userId, name: 'User', email: 'user@example.com', status: 'suspended' };
  }
  
  // DESTRUCTIVE: Delete operation - test-only by default, dangerous if AI-enabled
  @Tool({
    description: 'Permanently delete a user account',
    // aiEnabled: false by default for destructive operations
    // requiresApproval: true automatically inferred
  })
  async deleteUser(userId: string): Promise<void> {
    console.log('Deleting user:', userId);
    // Implementation would permanently delete user
  }
}

// Example usage:
export async function demonstrateUsage() {
  const userManager = new UserManagementProvider();
  
  // These would work in testing:
  console.log('=== TESTING (always works) ===');
  await userManager.getUserList();
  await userManager.searchUsers('john');
  await userManager.createUser({ name: 'Test User', email: 'test@example.com', status: 'active' });
  
  // These would work for AI (only if aiEnabled: true):
  console.log('=== AI EXECUTION (only for AI-enabled tools) ===');
  await userManager.getUserList({ status: 'active' });  // ✅ AI-enabled
  await userManager.searchUsers('admin users');         // ✅ AI-enabled
  await userManager.updateUserProfile('123', { name: 'New Name' }); // ✅ AI-enabled, no approval
  
  // This would require approval:
  // await userManager.suspendUser('123', 'Policy violation'); // ⚠️ Requires approval
  
  // This would fail for AI (not AI-enabled):
  // await userManager.createUser({ name: 'AI User', email: 'ai@example.com', status: 'active' }); // ❌ Not AI-enabled
  // await userManager.deleteUser('123'); // ❌ Not AI-enabled
}
