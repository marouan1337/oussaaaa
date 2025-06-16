'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const settingsFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().optional(),
  whatsappNumber: z.string().length(9, 'Must be 9 digits').regex(/^\d{9}$/, 'Must be 9 digits').optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: '',
      password: '',
      whatsappNumber: '',
    },
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();
          form.reset({
            name: userData.name,
            whatsappNumber: userData.whatsappNumber || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    }
    fetchUserData();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Settings updated successfully!');
      } else {
        setMessage(result.message || 'An error occurred.');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium p-2 bg-gray-100 rounded-md">+212</span>
                            <Input placeholder="600000000" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                Save Changes
              </Button>
            </form>
          </Form>
          {message && <p className="mt-4 text-sm font-medium">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
