"use client";

import { useRouter } from "next/navigation";
import { ExpenseForm } from "../../../../app/(main)/expenses/new/components/expense-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { Card, CardContent } from "../../../../components/ui/card";

export default function NewExpensePage() {
  const router = useRouter();

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-5xl gradient-title">Add a new expense</h1>
        <p className="text-white mt-1">
          Record a new expense to split with others
        </p>
      </div>

      <Card>
        <CardContent>
          <Tabs className="pb-3" defaultValue="individual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="individual"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:border data-[state=active]:border-indigo-300 data-[state=active]:text-indigo-700"
              >
                Individual Expense
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:border data-[state=active]:border-indigo-300 data-[state=active]:text-indigo-700"
              >
                Group Expense
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-0">
              <ExpenseForm
                type="individual"
                onSuccess={(id) => router.push(`/person/${id}`)}
              />
            </TabsContent>
            <TabsContent value="group" className="mt-0">
              <ExpenseForm
                type="group"
                onSuccess={(id) => router.push(`/groups/${id}`)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
