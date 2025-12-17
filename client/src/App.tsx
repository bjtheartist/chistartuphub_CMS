import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import AssetLibrary from "./pages/AssetLibrary";
import ContentCalendar from "./pages/ContentCalendar";
import CreatePost from "./pages/CreatePost";
import Goals from "./pages/Goals";
import Drafts from "./pages/Drafts";
import Analytics from "./pages/Analytics";
import MarketIntel from "./pages/MarketIntel";
import Settings from "./pages/Settings";
import Design from "./pages/Design";
import DesignEditor from "./pages/DesignEditor";
import { BrandProvider } from "./components/Layout";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assets" component={AssetLibrary} />
      <Route path="/calendar" component={ContentCalendar} />
      <Route path="/posts/new" component={CreatePost} />
      <Route path="/goals" component={Goals} />
      <Route path="/drafts" component={Drafts} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/market-intel" component={MarketIntel} />
      <Route path="/settings" component={Settings} />
      <Route path="/design" component={Design} />
      <Route path="/design/new" component={DesignEditor} />
      <Route path="/design/:id" component={DesignEditor} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <BrandProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BrandProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
