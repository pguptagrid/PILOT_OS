"use client";

import { Button } from "../../../../components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { useConvexQuery } from "../../../../hooks/use-convex-query";
import GroupBalances from "../../../../components/group-balances";
import { useParams, useRouter } from "next/navigation";
import GroupMembers from "../../../../components/group-members";
import React, { useState } from "react";
import { BarLoader } from "react-spinners";
import { ArrowLeft, ArrowLeftRight, PlusCircle, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import ExpenseList from "../../../../components/expense-list";
import SettlementList from "../../../../components/settlements-list";
const GroupPage = () => {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("expenses");
  const { data, isLoading } = useConvexQuery(api.groups.getGroupExpenses, {
    groupId: params.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }
  const group = data?.group;
  const members = data?.members || [];
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balances = data?.balances || [];
  const userLookupMap = data?.userLookupMap || {};

  return (
    <div className="container mx-auto max-w-4xl py-6 bg-gray-600 ">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-4 bg-black text-white mx-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-4 rounded-md mx-2">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl gradient-title">{group?.name}</h1>
              <div className="text-gray-700 ">
                <p className="">{group?.description}</p>
                <p className="text-sm  mt-1  font-serif font-semibold gradient-title">
                  {members.length} members
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:fl">
            <Button asChild variant="outline">
              <Link
                href={`/settlements/group/${params.id}`}
                className="animated-gradient text-white px-6 py-3 rounded-md
      "
              >
                <ArrowLeftRight className="mr-2 h-4 w-4 " />
                Settle up
              </Link>
            </Button>
            <Button asChild className="mx-2 gradient ">
              <Link href={`/expenses/new`} className="">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="mb-6 flex flex-col mx-3 shadow-2xl shadow-stone-900 ">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl gradient-title text-green-700">
                {" "}
                Group Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GroupBalances balances={balances} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6 flex flex-col mx-3 shadow-2xl shadow-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl gradient-title text-green-700">
                {" "}
                Members{" "}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GroupMembers members={members} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mx-3 p-2 shadow-gray-700 shadow-2xl"
      >
        <TabsList className="grid w-full grid-cols-2 border-2 ">
          <TabsTrigger
            value="expenses"
            className="border-r-2   shadow-stone-800 shadow-2xl data-[state=active]:bg-indigo-50 data-[state=active]:border data-[state=active]:border-indigo-300 data-[state=active]:text-indigo-700"
          >

             Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger
            value="settlements"
            className=" border-r-2 shadow-stone-800  data-[state=active]:bg-indigo-50 data-[state=active]:border data-[state=active]:border-indigo-300 data-[state=active]:text-inigo-700 shadow-2xl"
          >
            Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="space-y-4">
          <ExpenseList
            expenses={expenses}
            showOtherPerson={true}
            isGroupExpense={true}
            userLookupMap={userLookupMap}
          />
        </TabsContent>
        <TabsContent value="settlements" className="space-y-4">
          <SettlementList
            settlements={settlements}
            isGroupSettlement={true}
            userLookupMap={userLookupMap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupPage;
