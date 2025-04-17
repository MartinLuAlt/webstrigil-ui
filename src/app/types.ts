export interface CrawlResponse {
    success: boolean;
    message: string;
    history: HistoryEntry[];
    errors: CrawlError[] | null;
  }
  
  export interface HistoryEntry {
    depth: number;
    details: PageDetails;
    prev_page_action: PageAction | null;
    summary: string;
    actions: PageActionDetailed[];
    visited_keys: string[];
  }
  
  export interface PageDetails {
    url: string;
    title: string;
    body_text: string;
  }
  
  export interface PageAction {
    url: string;
    action_key: string;
  }
  
  export interface PageActionDetailed {
    action: 'click' | 'stop'; // You can expand this as needed
    target: string;
    reason: string;
    goal: string;
  }
  
  export interface CrawlError {
    error_type: string;
    message: string;
    details: Record<string, any>;
  }
  