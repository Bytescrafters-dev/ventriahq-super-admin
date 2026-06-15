"use client";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TenantGeneralTab } from "../../components/TenantGeneralTab";
import { TenantSubscriptionTab } from "../../components/TenantSubscriptionTab";

const UpdateTenant = () => {
  const params = useParams();
  const tenantId = params.id as string;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Update Tenant</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <TenantGeneralTab tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="subscription">
          <TenantSubscriptionTab tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="invoices" />
      </Tabs>
    </div>
  );
};

export default UpdateTenant;
