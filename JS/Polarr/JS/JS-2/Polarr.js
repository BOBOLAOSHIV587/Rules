(() => {
  const { url } = $request;
  const endpoints = [
    {
      match: "v1/payments/profiles/@me/subscription",
      body: {
        isSubscribed: true,
        planId: "co.polarr.ppe.premium.studio.yearly",
        subscriptionProduct: "yearly",
        isTrial: false,
        app: "PPE",
        isUnlimited: true,
        expiryDate: "2099-12-20T22:00:00.000Z",
        planType: "yearly",
        planTier: "studio",
        startDate: "2023-12-20T22:00:00.000Z",
        subscriptionTier: "studio",
        paymentChannel: "AppleIapSubscription",
        membershipExpiryDate: "2099-12-20T22:00:00.000Z"
      }
    },
    {
      match: "v1/payments/appleiap/receipts/confirmation",
      body: {
        app: "PPE",
        planType: "yearly",
        planTier: "studio",
        isUnlimited: true,
        membershipExpiryDate: "2099-12-20T22:00:00.000Z"
      }
    }
  ];

  try {
    JSON.parse($response.body);
  } catch {}

  let responseBody = {};
  for (const endpoint of endpoints) {
    if (url.includes(endpoint.match)) {
      responseBody = endpoint.body;
      break;
    }
  }

  $done({
    status: 200,
    body: JSON.stringify(responseBody)
  });
})();
