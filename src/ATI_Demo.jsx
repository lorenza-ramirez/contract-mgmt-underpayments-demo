import React, { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Upload, FileText, ChevronRight, ChevronDown, Check, CheckCircle2, AlertTriangle, X, Search, Sparkles, Send, Clock, Link2, Loader2, Info, Receipt, BarChart3, Circle, PanelLeft, Bell, Mic, BookOpen, Settings, HelpCircle, Download, Plus, ThumbsUp, ThumbsDown, ZoomIn, ZoomOut, ArrowUp, ArrowRight, SkipForward, ListChecks, SlidersHorizontal, ListFilter, ChevronUp, ChevronLeft, Printer, Maximize2 } from "lucide-react";

/* ============================================================
   ATI DEMO, Mock B: Contract management and underpayment engine
   All data is fictional. Payers, patients and amounts are synthetic.
   ============================================================ */

const CONTRACT_TEXT = "PROVIDER PARTICIPATION AGREEMENT\n\nCascadia Mutual Health (\"Payer\") and Ridgeline Physical Therapy Group (\"Provider\")\n\nEffective Date: January 1, 2025\nTerm: through December 31, 2027\n\n1. PARTIES AND FACILITIES\n1.1 This Agreement covers outpatient physical therapy services rendered at Provider facilities in Hartford CT, Stamford CT, Springfield MA, and Worcester MA.\n1.2 Payer entities covered by this Agreement are Cascadia Commercial and Cascadia Medicare Advantage.\n\n4. COMPENSATION\n4.1 Choice PPO (Cascadia Commercial). Provider shall be paid 78% of the Cascadia Outpatient Therapy Fee Schedule (Exhibit B) per unit of service, at all Provider facilities in CT and MA.\n4.2 Select HMO (Cascadia Commercial). Provider shall be paid a flat rate of $64.00 per visit, regardless of units billed, up to four units per visit. This rate applies at Provider facilities in CT only.\n4.3 Annual Escalator. On January 1 of each year beginning January 1, 2026, the rates in Sections 4.1 and 4.2 shall increase by 2.5%.\n4.4 Senior Plus (Cascadia Medicare Advantage). Provider shall be paid 95% of the current Medicare Physician Fee Schedule (Exhibit C) per unit of service, at all Provider facilities in CT and MA. Section 4.3 does not apply to Senior Plus.\n\n5. LICENSE AND STATE REQUIREMENTS\n5.1 Services furnished by a physical therapist assistant (PTA) and billed with modifier CQ shall be paid at 85% of the applicable rate.\n5.2 In Massachusetts, every claim line must identify the supervising licensed physical therapist as rendering provider. Lines without this identifier are not payable.\n\n6. UTILIZATION\n6.1 Select HMO members are covered for 30 visits per plan year. Authorization is required beginning with visit 13.\n\n9. DISPUTES\n9.1 Provider may dispute any payment that differs from the rates in this Agreement.\n9.2 Payment disputes must be submitted in writing within 180 days of the remittance date.\n\nEXHIBIT B. CASCADIA OUTPATIENT THERAPY FEE SCHEDULE (2025)\nCPT 97110 Therapeutic exercise, per 15 minutes: $42.00\nCPT 97140 Manual therapy, per 15 minutes: $39.50\nCPT 97530 Therapeutic activities, per 15 minutes: $48.00\nCPT 97112 Neuromuscular re-education, per 15 minutes: $46.00\nCPT 97161 Physical therapy evaluation, low complexity: $138.00\n\nEXHIBIT C. MEDICARE PHYSICIAN FEE SCHEDULE REFERENCE (national amounts)\nCPT 97110: $29.50\nCPT 97140: $27.80\nCPT 97530: $34.10\nCPT 97112: $33.40\nCPT 97161: $98.20";
const SAMPLE_PDF_NW = "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNCAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YxIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKMyAwIG9iago8PAovQmFzZUZvbnQgL1RpbWVzLUJvbGQgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YyIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNCAwIG9iago8PAovQmFzZUZvbnQgL1RpbWVzLVJvbWFuIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMyAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0NvbnRlbnRzIDEwIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9QYXJlbnQgOSAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNiAwIG9iago8PAovQ29udGVudHMgMTEgMCBSIC9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0gL1BhcmVudCA5IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago3IDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgOSAwIFIgL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjggMCBvYmoKPDwKL0F1dGhvciAoXChhbm9ueW1vdXNcKSkgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MTExNzIyNTQ0NyswMCcwMCcpIC9DcmVhdG9yIChcKHVuc3BlY2lmaWVkXCkpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MTExNzIyNTQ0NyswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0IChcKHVuc3BlY2lmaWVkXCkpIC9UaXRsZSAoXChhbm9ueW1vdXNcKSkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iago5IDAgb2JqCjw8Ci9Db3VudCAyIC9LaWRzIFsgNSAwIFIgNiAwIFIgXSAvVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjEwIDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDExMTEKPj4Kc3RyZWFtCkdhdD1qP1o0W1cnWkp1JC40dHI5ODtHSiguRVNqbGsvQ05lL2NKW1E9YjM7I04ncGVnQUJIMklWczoySy0iWSY8Vl5kTDJeaWo3TnBZPVhkXUYiWk0/YzlXKjQrS1ApcSMqdGlLTDIxMCNtTEZLRzdfX3BUPEg/K2NDNUNTYHRXSTNDUyYvOFtUQnR0NFJGdFlHX2BuLStARWFLVjAzQy9IXDleWktLbUwrPmQpYCVJcVI1RCU/bCMlLiUzWWFwYmciaTYyVzgyRyc1KjJJWkxdKGw2QkMvYS9fU1VWXlo6OXEqOWMlL0A6a0soU3JuX1VRP3ImYEU/Vmk9Oz1OSFZzQEQ3PGNkcyFkcWBAZGdLTENXPzNuWV1RLksxYlhGTjpuTVg+MihWb2ljQyg5JGRIO1JgT2pVZjJWMl0hVkBrYkknaUNgWTBSLCoyXnNMXCsiVEFlM01qam9rO3UuXyZMLyU9Tm89YC9YUk80aDwlZkg9bm5TaDI8cTRXTmxOMS1MLFplSFNgOCtPRTklXnAhQSd1P19mR1xkOUdVUkIhKTtwI2olWEg3NU8+RjxgZ3M1cCFKL2ZyZkpAKSwsNStRMEs5L1dTX15SRkNlXj1XXnIrXm1kWlZqKGwpLWVRITFwQ24+QSIpMltXaW45XSNFZHMkYlEnL047ck5aXVUoRmlnUStcY0dadDpcTkU8WU4hQ1I0JUhrL1FVTjAqPCw5MyJWJGU/TEBlNl8hUTBWTUFEW1E0QmpIN1dXckVXbkwqRF5wWi1JN0dzJCZRNVciLlg7QiFMZV9jJ0M2KzQ2RVs0OXUkJjgiOmU7VyRNQEpBb0wtRyYjKElrOEw8YyxcQmJpYzFFVXJlIy9MSytQN0ZOMyc0ImRxOUdEK1hbRk80OCFpOCIjPzdYZSdkJ2E5PUIqcWFRKVgzPWlWK25eKDA9WmhOJiI+SjcuRixMLD0zKGczWW9nOyYxZSg7V3IqWmY6aXQ6ZFVfImtNaztpcUFjSGkia08zZ3RpVyplaTZZcDRWO3JFbCk1a29ldG9tSzhwTj9fcjhkK2xza2s/LUY8TmY5cCtbVlphdTNtaEM3RmhdaTFgXUkvajREZiUlWUpnTVFqP1IrT0UuUiNBM1MuQkJqNmhmOztOYGNxN0cjPUVqb3JnPlpqZF5FWENVZEZOIy87ZGM/SD11Q1VXZDdXKElIN2dPOGEqXVdgTl47PjVnZnIrPSVVIWlVU0E0YCRPMVBsY2dHQmVULGc0PkdfJ100Zyw+cCg/N1BJWzdsTUpfVHM8Lm9RI09jcERoWEUtJ0s/QVhJU3NXaDNFUHRLVCpLXlBIWUxqMkNFY10nXyplYjwmNGMmc01tRTo6PjxJdGNsX1dIdCx0JztIWWlqbiwmOFJVTlM0UGRjRC0vTTgpQ0FcLVxJNElQSz9sX1AoZD1RMTwsS1FqVyFvIjg5Q2xEcWFgdUhHSnVgaFBcXCdtfj5lbmRzdHJlYW0KZW5kb2JqCjExIDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDUwOQo+PgpzdHJlYW0KR2F0VW8/I1MxRydTYylSLylDWXEyP1kwTj9WUG4hNilJWTYyUkpiTUJmRWpnVUlQJi1ObWhrRipdSzxgNXBEKy05PjNBSDUwbWBSMTtVQVZcbTpXO1EsKV4kIWRQPyRUWUxqVmhCPEpwbWg3YSk6MUhcdWE+VmVBZ1hZckpNKjQ9KFA5UGgyOkBXZC1NMnNHRlAjIiRbWC8zVktfLnBYcTJdbkJlXChFNiJaR2w0TWtAQ2d1aC1PRFNJIlFaYCxedXR1OlMhNS1lRE1fKSM+bXUjNDZpaXNBcDpHWSosMyE1TSo1WF1QcW88LGQnLFxeYW4lZjEpI1FKZTllJWlkJyJKUThmJUhYIVVFb1ZjWzhbVS0tMEJJN2Ela2guJE1hVTZKXF04JVhENSdDVlhvJyFVRWRldTdiZF0tVS1sXEZwSWxLSjplI0hSO1tDSSQjOFApbk5JUUJmLnJLSzhbWiwqXTlMSkQlYzxIXFM8RUZTWGY6Y1c0V0I0OS4sLERpazdgZl1baSdVUFAtXWIiOUxUSltJXyU0XFkmaXV0ZyctaUFUR00iSTZOQXBIYGMscilWN0RqVytvPV9wJ0gxQ29eZmQnanVqUk5dRUFyXGl1SWYtViknXihMWWFmN0pQM05lZFRQcmZxKF8sJmBGXlVbZUQhdGBAM3Fafj5lbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCAxMgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwNjEgMDAwMDAgbiAKMDAwMDAwMDExMiAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCjAwMDAwMDAzMjcgMDAwMDAgbiAKMDAwMDAwMDQzNiAwMDAwMCBuIAowMDAwMDAwNjMwIDAwMDAwIG4gCjAwMDAwMDA4MjQgMDAwMDAgbiAKMDAwMDAwMDg5MiAwMDAwMCBuIAowMDAwMDAxMTcyIDAwMDAwIG4gCjAwMDAwMDEyMzcgMDAwMDAgbiAKMDAwMDAwMjQ0MCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9JRCAKWzwyYWY5YTdjYWZhZDc4M2NjMzkxMTRhYzRjODIyMDQwZj48MmFmOWE3Y2FmYWQ3ODNjYzM5MTE0YWM0YzgyMjA0MGY+XQolIFJlcG9ydExhYiBnZW5lcmF0ZWQgUERGIGRvY3VtZW50IC0tIGRpZ2VzdCAob3BlbnNvdXJjZSkKCi9JbmZvIDggMCBSCi9Sb290IDcgMCBSCi9TaXplIDEyCj4+CnN0YXJ0eHJlZgozMDQwCiUlRU9GCg==";
const SAMPLE_PDF_HB = "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNCAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YxIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKMyAwIG9iago8PAovQmFzZUZvbnQgL1RpbWVzLUJvbGQgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YyIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNCAwIG9iago8PAovQmFzZUZvbnQgL1RpbWVzLVJvbWFuIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMyAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0NvbnRlbnRzIDEwIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9QYXJlbnQgOSAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNiAwIG9iago8PAovQ29udGVudHMgMTEgMCBSIC9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0gL1BhcmVudCA5IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago3IDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgOSAwIFIgL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjggMCBvYmoKPDwKL0F1dGhvciAoXChhbm9ueW1vdXNcKSkgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MTExNzIxNTkxNyswMCcwMCcpIC9DcmVhdG9yIChcKHVuc3BlY2lmaWVkXCkpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MTExNzIxNTkxNyswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0IChcKHVuc3BlY2lmaWVkXCkpIC9UaXRsZSAoXChhbm9ueW1vdXNcKSkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iago5IDAgb2JqCjw8Ci9Db3VudCAyIC9LaWRzIFsgNSAwIFIgNiAwIFIgXSAvVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjEwIDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDEwNTIKPj4Kc3RyZWFtCkdhdD0pPkU+NzUnUmxaXW5Zb0VfbCJcRF1nYlMrNSlxWyghLGEyIWU2V1xeK0oyO0VSLThkK3BxV21tQzlWdE5RQmRaNGs1altQImskcyxQPyooZVIoJT9GKV5dJVlMMCUpPj1uK11HV09lYGUjMCVmNCprblYoJzk3dUtgViNSPVwwNSk4TldZP1laVy86cnVnKyc3QENQNVgsJGdHdG9hNW8oNShcOztQQGk7RENbbjJPKEZJT0QxaigmbVM+ZVdRJCs0PENDcVJcMjBodWQ4Xy4nQGsxNUNPJ3AoY01ERWJsX0g9X25dYG5JKWtuY1hnJ1Y5I2VVaGAxXjJIOCleVFRZY14tPDldRyguXGs/JFJrYTAhU1M3NEZNO10nKCcjbklmT1oxdUVHI1g2WHJcOlhKY0BrNUNlcFNPIVNgKWt1N2JTa2dOX0RGSjB1PzZDUi1EdCdAIVFLbyVJOlVoJnMqKDtUTTRiKC5Fa2lyVU42JmI3P2AkLGxGU14/a1RBJWM4LilkaltbN3VkQl1XXkFWSEg1K1Q+QXElJ103W05edVosMTw4YUgmQFI8bGJKQlNkVWdtKCYyWko5JHRIKEdnKz8vakNIJEw7L3NTRDc/Mz1CSlo7ZSdgYkBfNmpQVTZfMyswb2M9XDwySTg5RyZgM05uXlJrJTFaNzdbXmQmSjhrTChxTCU3LCNPQ1UmMTBMR2AkaTg/QXE4bVNJXEw1NmdfOTNJOCFeIUhILkhqKF1mPCgyP1JhZVN0QCQ7PExEYkVBUlwicCVePV5jKUc7Uk5rUHFtI2YwTlIzJD9NLEFqJUArPUo2aUg6OkxILmQzX0NYcDRIZlY5YlEvRHRBOiVpNGhFMk5QKSE8ckpbZFomXSJZcixbQzZmR24hUGFKbjpmS3ItdWdGbDptbT5FQSNRTyksNUxlJ0pWLGsoRWMpOU86b3UvPGZPVVtPZkUxXURiKEhdXC1zQEw5cCMmUXNXQEFqVGEqXjdeUUpMZEloKmZEL1hgVE4/NiZWPz8wMStXKjVAOjE6Tk1wbDFIL241dSldNko9TGkuOzJqPCxwbVxoYkpodWNiLXMnNEFUU0koSmNrNF1nM0YqcjQ7N2RoaDJGaUdaajkyK2tQci5RN0cvLS1LY2xbQGZTYCxuJ2krJ0AuP01rYj1NanI4TFVALkBWUyxCdV44RDw3PjIrPVkvZjcpSiozaXMwKT4lblhmXTBPLWEpS04qYGVZLXRaKzpnUHEubHVCVlBga1lWPFEyV2lsQmNDLTdfXT9PVXJpIkVaMjFqWGhBSkk0K0I5JWdwRy07SVJ1VTcuJVlnIUdXR0c4UWFbJ0l0O1JfQlVTJGlxLWdKYDI4MWRza15XN3EvIWUjalcyYDUwRm07KmZyI34+ZW5kc3RyZWFtCmVuZG9iagoxMSAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAzNzYKPj4Kc3RyZWFtCkdhdD1lYj4sci8mNFE/aE1TITlEK3UjRUFPK3BybyMuNz46LHJIKCtEQmBTaDstdTsmN0s6KT5LUmc6XzZvOzFjVVteTGYyU2xkaWVMaWJxSkUsZFA1VF1cTmFDZF4zJ0llNWkqO1orX3E/Wi02JWJtUlpwJTRfYE8zcjA3NGdWQ0I0VjFVQl8pXDlzKGxtKG1ka2g0X04wQSlJT0M9SDgtR3NATDZDLitfSlMiIik5ZXQpJGdCRSczXkhALGpEOlJUZ3I+UnFqRjJTWlEkYmhjYmhiLWx0IVZuMVA6a2NSIT8+PmswLlc5O20xJGNIMiFeWT0+XmlxTlZbakdJV1g/O01jRkokT3NrWyltVypWQVdAY1VGZkNXYDY6Ji48bG1BUmhdYVNsZlwiXTA5K2gqOUhoVkBmP2oobF4pMyEhQzpDPFwmO3FHYUslUCJEJkpGNixBImdpZTJhQUdUW0pBcCg6ZGxaQ0hIYz08IXA5XS5aR2Qrfj5lbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCAxMgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwNjEgMDAwMDAgbiAKMDAwMDAwMDExMiAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCjAwMDAwMDAzMjcgMDAwMDAgbiAKMDAwMDAwMDQzNiAwMDAwMCBuIAowMDAwMDAwNjMwIDAwMDAwIG4gCjAwMDAwMDA4MjQgMDAwMDAgbiAKMDAwMDAwMDg5MiAwMDAwMCBuIAowMDAwMDAxMTcyIDAwMDAwIG4gCjAwMDAwMDEyMzcgMDAwMDAgbiAKMDAwMDAwMjM4MSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9JRCAKWzw2YmJiY2EwOTZlN2U5OWQ0NjgyMGY3YTMyMzNkZDA5MT48NmJiYmNhMDk2ZTdlOTlkNDY4MjBmN2EzMjMzZGQwOTE+XQolIFJlcG9ydExhYiBnZW5lcmF0ZWQgUERGIGRvY3VtZW50IC0tIGRpZ2VzdCAob3BlbnNvdXJjZSkKCi9JbmZvIDggMCBSCi9Sb290IDcgMCBSCi9TaXplIDEyCj4+CnN0YXJ0eHJlZgoyODQ4CiUlRU9GCg==";
const SAMPLE_PDF_B64 = "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNCAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YxIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKMyAwIG9iago8PAovQmFzZUZvbnQgL1RpbWVzLUJvbGQgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YyIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNCAwIG9iago8PAovQmFzZUZvbnQgL1RpbWVzLVJvbWFuIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMyAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0NvbnRlbnRzIDExIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9QYXJlbnQgMTAgMCBSIC9SZXNvdXJjZXMgPDwKL0ZvbnQgMSAwIFIgL1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KPj4gL1JvdGF0ZSAwIC9UcmFucyA8PAoKPj4gCiAgL1R5cGUgL1BhZ2UKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL0NvbnRlbnRzIDEyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9QYXJlbnQgMTAgMCBSIC9SZXNvdXJjZXMgPDwKL0ZvbnQgMSAwIFIgL1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KPj4gL1JvdGF0ZSAwIC9UcmFucyA8PAoKPj4gCiAgL1R5cGUgL1BhZ2UKPj4KZW5kb2JqCjcgMCBvYmoKPDwKL0NvbnRlbnRzIDEzIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9QYXJlbnQgMTAgMCBSIC9SZXNvdXJjZXMgPDwKL0ZvbnQgMSAwIFIgL1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KPj4gL1JvdGF0ZSAwIC9UcmFucyA8PAoKPj4gCiAgL1R5cGUgL1BhZ2UKPj4KZW5kb2JqCjggMCBvYmoKPDwKL1BhZ2VNb2RlIC9Vc2VOb25lIC9QYWdlcyAxMCAwIFIgL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjkgMCBvYmoKPDwKL0F1dGhvciAoXChhbm9ueW1vdXNcKSkgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MTExNjIyMzQ1NyswMCcwMCcpIC9DcmVhdG9yIChcKHVuc3BlY2lmaWVkXCkpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MTExNjIyMzQ1NyswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0IChcKHVuc3BlY2lmaWVkXCkpIC9UaXRsZSAoXChhbm9ueW1vdXNcKSkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iagoxMCAwIG9iago8PAovQ291bnQgMyAvS2lkcyBbIDUgMCBSIDYgMCBSIDcgMCBSIF0gL1R5cGUgL1BhZ2VzCj4+CmVuZG9iagoxMSAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAxNDU0Cj4+CnN0cmVhbQpHYXRVMkA7aG8xJkgvMi0wZm8hJ1YiLkE5Mk5FNEMzLzphRGBBK1ZoLm9sRE5MO2RzNCRiJE1YXSJidGNNbnF1RkUoVlRRTTZQWyRII01UUSkkMzInJkclaikhNThVKmdHSyJANlAnPjs+QFJxVl8kZVEmU1dWcyVRVyc5cUNqWyw4KWstNlZtTDUvPTJVVl9bJSY7SD8tOUAkJGxQUGc/clhxVjxtXVRdQS8/WldDcSFMMUZiU1J1NC82NnVRSVUuPFdkXm9sPitTWm4tP2Y9cSkhamdlRWtCUjUwO28tWHEtYCFyS0VGJTAlI1ZrTl8/LlxuQldmVF0/X1FrWEFSX2ZOL0JwbGNzcSQzTjVSL0hHdSFFO0lrazBdM2M+VlBaMktBbiZnKSdobyhpVyo9cz81O1VRYmtGNFRCLFZKVGBCMGxycHNKVHVgSHVVS19OT0AqPmdcXl9MPlN1L1cmdCV0SjNDOTFoQz04ZFwqIi1kYldcQ14rUT9aLj0iSW44UTpWcURxKERSODNPO2luQz9NbnNiImJqNyJaXEc/Jj8/Uy1bZlE2ayRFaTRcaWNfIjtIaDM7Z14uYChnJCgraWlQXS1mbzosOCtpOypwWj1SOGY4TEFPL3RsXkY6J2lQWGUuai1NS1c1JDckOmAjOFI9bFRodSc1MXVwKytVQytNRThqOiJgWkFgaUJfKXJSTVZQTW8wVG9gT0dAYTxDLVFMO1Ewbl10SExyIj5iVj8pbk0wR2guNWRZSlJgYWE8KHQjPylpSTg4QEFiVnEyPms3KTczWytjYS9TUE88WV5VYztTcWwjVXRxPGBUcCE/LlNAOV5yVC1oZTwmPHJcb1BXMzwvWFdgLV4zQCVATm1qS0pJWklPTFcwTVhrajJIWj5ZTCFoQTg5cWtQOi1xYmA5aUtcIi1uKC0xbW1rSC9YZT9ERFgmYGFfRGlPJ2YxQnM9JkA4VzpGYmlTZWVuMT88UCRpM2tTWXEoQTkpIiZma0pRQUdoZXVfOWdSQ1RKbUxoU1xvTy1tcDhWQD8yR1c4TTpgRyRaVDguMkZTYWkmJSo2LT1eZ04xYDVzbG5UKXUzLE1BKyItdFEkOHBHO21YW1FJOGUxXVRBcjE1QGltalJKJCFdTiteOCN1P0knZVYoVGhYZFoubVVrYURiU0Mrck4pTSdEbCpeTGpxSzkxLmdfK0w0Wz8pKGpjOV0zXmI3IWEjXSNXLjhQVkVZcTgkIylOIWlmK3VqXFBSaElDb1BqLFhmblI1UllzdXRXZ04za2dOI0xPVURybjpzJiZPS2QkcXQuJChhZlpkbjJiPDYvckMjM15TbEVBa3EpK0AzcWJZVC0nVCIqbWdGN2Y2ViEsSXNbdDdbOCFWUjA/V2ZCT2RBTysjOypENEo5cmBRQjNqOE5OPTQrJjohVSQlRnRsTEpvPzpuJyJFKi82ZzpNaTpYTmJxPTQhSk5ncUtDaEgpSWJlUmNuTCtAM14jZFlhNUloOTtLLm9OMVA8RTNQJEIvLzkmVyJJRk0mU1hFMCUmI2g2WlVBaXU0NkYmXWAhQEA9SjVdI247b2dhYnBybzRYbjpVRUNkUVFoJDFSSlBRImtdUSJHMENHODo3RyNRUGdMO1FNRyIhI1NKUCIsJixiKTQ0RFlXdDZPKyQibXEhMFZ0YktkLkFhQltvYWpnJEJdS2VvPks1UCVcWENJN3BZKnBAcnU5IV9EUy1cYTJeJCovKTxtJkxdb3FUJylNLUJEVVFJS0xcPCYxNDlXME5yVW5ZODkjcylJTEBOQzczS2ZmZDtdMnNlRWU2QGQpSDpTP1tEcyg0cUxDSXQkZXUqUlA1SltlPjhPWzBaWXBSOzQmK2IzL2E1YFAtNEd1NTVDcF5kI0QoQFxBXE9ZS1IwP1pNTlcwUmZZZk9dN0ltQHFXcF1+PmVuZHN0cmVhbQplbmRvYmoKMTIgMCBvYmoKPDwKL0ZpbHRlciBbIC9BU0NJSTg1RGVjb2RlIC9GbGF0ZURlY29kZSBdIC9MZW5ndGggMjgyCj4+CnN0cmVhbQpHYXQ9YjV1NUJQJSMrMEsoJTk0J1BeODpuKl5QQWtMSj5vNWFCIzJBLkkhLy45YD1dRlYqYTFZIUVsa2xrTkFiKGN0TGZoOkI+XHVcOWZPSylUST1kb2BqT2YwO2M8W1pvQi5PZlhAb048R1ExdW9wKjg9OlFrXFs5dDpNVlNGVEszRFZDUGA6VycrITMkSG9cU142SXIoY0csS2dGNyhVYUxgME0zNipKY1YnMmVTODYuXmY3cFVNXjtrS0c4XTNgPSRedF1ePktAWHMxbT0tZ21aIVU8Q11Tbk9WXzMnbCNBKzFcdCdwPEEnaWFcJU09L0g4VzI8YUNrMHQ7LjIvbGlvZVhLcT9RVXRfPTA6bmReZScyISRtfj5lbmRzdHJlYW0KZW5kb2JqCjEzIDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDU2NAo+PgpzdHJlYW0KR2F0VW9iQVEmZyY0UT9tTUhQJlsnSjJbTVVgU0A2MSg9VV4+aCpHOiMwOTgxUiJVLzdYc0JuN2hqNzYoKCtwIjY6ZElAKV8uYDhRYmU0LmBJOlc2ayd1My9RamJhJjMrPFErZmAnQFhbT0woUThvJSJcM2koKEx1W1BeMXVnO2ZXW05WbzQqSzw0RFJxRT8yRkIkQTZnRmgxKmkvLmEpcy9yPnAvJHQhcGAoPF1abixmbUNHYG47ckZLUmRANig8YDB0IUkmVUIuRE5MKSE7UWBYYHJZN2pJRSsjQkdKVUxiKF82bGlASkMrbEEua1ZlJi5KLCRbSj0tcz81SzhAPCpTUV1JPWYuSUxYbylMVkg7UmlwcVM7cGZTUkd0QS40NE8zajI3YTY5aW08OiZvTU5pYmViQlJnUXNFaiN1SGxZRmZzQDxIaTBraU9NXDhaVk5haktvSWopO2pqZEJBX29iUzUtJyQvakxvSHI7X1wxZyhgbmddMEt0J1NsLVNcU21wU0lFa0c8SSEuQFhbQDF0Qjw+MD1qQU0pV0k9QiUxYnQhSiNmMGlfTlslX1BwIVJQYjs+J2Ihal9MZC9rc2M9Ri5CIy09R2EwNCxYXDxrT1prR1UxJDxpNFIoRGJBLkg9c01dYTstWlUkKT9zVTwzREIhPylYUidZNSQyYWk6W28pKUI4RUVAXlBDREJqNyJuLjlYa0drYU4kQ19gWlU7Nz9WR1k4MmlGRGluQz1SS34+ZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgMTQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAxMTIgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAowMDAwMDAwMzI3IDAwMDAwIG4gCjAwMDAwMDA0MzYgMDAwMDAgbiAKMDAwMDAwMDYzMSAwMDAwMCBuIAowMDAwMDAwODI2IDAwMDAwIG4gCjAwMDAwMDEwMjEgMDAwMDAgbiAKMDAwMDAwMTA5MCAwMDAwMCBuIAowMDAwMDAxMzcwIDAwMDAwIG4gCjAwMDAwMDE0NDIgMDAwMDAgbiAKMDAwMDAwMjk4OCAwMDAwMCBuIAowMDAwMDAzMzYxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL0lEIApbPGQyZjk0MDJlNTA5MGYzMDhlMzg2NDRhZmRlODNmMmRkPjxkMmY5NDAyZTUwOTBmMzA4ZTM4NjQ0YWZkZTgzZjJkZD5dCiUgUmVwb3J0TGFiIGdlbmVyYXRlZCBQREYgZG9jdW1lbnQgLS0gZGlnZXN0IChvcGVuc291cmNlKQoKL0luZm8gOSAwIFIKL1Jvb3QgOCAwIFIKL1NpemUgMTQKPj4Kc3RhcnR4cmVmCjQwMTYKJSVFT0YK";

/* ---------- helpers ---------- */
const TODAY = "2026-11-16";
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n, d = 2) => (n == null || isNaN(n) ? "n/a" : (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
const fmtDate = (s) => (s ? new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const rng32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* ---------- reference data ---------- */
const CPT = { "97110": "Therapeutic exercise", "97140": "Manual therapy", "97530": "Therapeutic activities", "97112": "Neuromuscular re-education", "97161": "PT evaluation, low complexity" };
const CPT_LIST = Object.keys(CPT);
const CHARGE = { "97110": 85, "97140": 80, "97530": 95, "97112": 90, "97161": 210 };
const FS_CASCADIA = { "97110": 42, "97140": 39.5, "97530": 48, "97112": 46, "97161": 138 };
const FS_MEDICARE = { "97110": 29.5, "97140": 27.8, "97530": 34.1, "97112": 33.4, "97161": 98.2 };
const FS_MEDICAID = { "97110": 21.4, "97140": 20.1, "97530": 24.8, "97112": 24.1, "97161": 71 };
const METHOD = { percent_of_fee_schedule: "% of fee schedule", per_visit: "Per visit", per_unit: "Per unit", case_rate: "Case rate", per_diem: "Per diem", per_code: "Flat rate per code", percent_of_billed_charges: "% of billed charges", other: "Other", multiple: "Multiple" };

/* ---------- contract model ---------- */
const NUMBERS = { cascadia: "CTR-2025-0147", summit: "CTR-2024-0112", keystone: "CTR-2025-0063" };
function buildContract({ contract, plans, feeSchedules, terms }, extra = {}) {
  const c = { ...contract, ...extra };
  c.feeSchedules = feeSchedules || {};
  c.number = c.number || NUMBERS[c.id] || "CTR-" + String(c.effectiveStart || "2026").slice(0, 4) + "-0000";
  c.rows = plans.flatMap((p) => {
    const fs = (feeSchedules && feeSchedules[p.feeSchedule]) || {};
    const mk = (cpt) => ({
      id: `${c.id}-${slug(p.plan)}-${slug(cpt)}`, contractId: c.id, svc: cpt === "All PT codes" ? "All PT services" : (CPT[cpt] || cpt), year: null, basis: null, payer: p.payer, payerGroup: p.payerGroup, planType: p.planType, plan: p.plan, cpt,
      method: p.method, base: fs[cpt] != null ? Number(fs[cpt]) : null, discount: p.discountPct != null ? Number(p.discountPct) : null,
      flat: p.flatRate != null ? Number(p.flatRate) : null, facility: p.facilities || "All facilities", state: p.states || "",
      units: p.method === "per_visit" ? `Per visit, max ${p.maxUnits || 4} units` : "Per unit", apptType: cpt === "97161" ? "Evaluation only" : "All",
      start: c.effectiveStart, end: c.effectiveEnd, escalates: !!p.escalates, source: p.source || "",
    });
    return p.method === "per_visit" ? [mk("All PT codes")] : CPT_LIST.map(mk);
  });
  c.plans = plans;
  c.terms = (terms || []).map((t, i) => ({
    ...t, id: `${c.id}-t${i}`,
    ruleKey: /escalat|increas|\brise|\braise|annual|1\.0\d\d/i.test((t.summary || "") + " " + (t.then || "")) ? "escalator" : /\bPTA\b|\bCQ\b|assistant/i.test((t.summary || "") + " " + (t.then || "")) ? "pta" : null,
  }));
  return c;
}

const CASCADIA_RAW = {
  contract: { id: "cascadia", masterPayer: "Cascadia Mutual Health", provider: "Ridgeline Physical Therapy Group", effectiveStart: "2025-01-01", effectiveEnd: "2027-12-31", escalatorPct: 2.5, escalatorStart: "2026-01-01", ptaPct: 85, disputeDays: 180 },
  plans: [
    { payer: "Cascadia Commercial", payerGroup: "Commercial", planType: "PPO", plan: "Choice PPO", method: "percent_of_fee_schedule", discountPct: 78, feeSchedule: "B", facilities: "All facilities", states: "CT, MA", escalates: true, source: "78% of the Cascadia Outpatient Therapy Fee Schedule" },
    { payer: "Cascadia Commercial", payerGroup: "Commercial", planType: "HMO", plan: "Select HMO", method: "per_visit", flatRate: 64, maxUnits: 4, facilities: "Hartford, Stamford", states: "CT", escalates: true, source: "flat rate of $64.00 per visit" },
    { payer: "Cascadia Medicare Advantage", payerGroup: "Medicare", planType: "Medicare Advantage", plan: "Senior Plus", method: "percent_of_fee_schedule", discountPct: 95, feeSchedule: "C", facilities: "All facilities", states: "CT, MA", escalates: false, source: "95% of the current Medicare Physician Fee Schedule" },
  ],
  feeSchedules: { B: FS_CASCADIA, C: FS_MEDICARE },
};
const CASCADIA_TERMS = [
  { section: "4.3", category: "Rate", summary: "Choice PPO and Select HMO rates rise 2.5% each January 1, starting 2026.", when: "Plan is Choice PPO or Select HMO and service date is on or after 1/1/2026", then: "Multiply the contracted rate by 1.025", source: "On January 1 of each year beginning January 1, 2026" },
  { section: "5.1", category: "License", summary: "Services by a PTA billed with modifier CQ are paid at 85% of the rate.", when: "Claim line has modifier CQ", then: "Pay 85% of the contracted rate", source: "billed with modifier CQ" },
  { section: "5.2", category: "State", summary: "Massachusetts lines must name the supervising licensed PT as rendering provider.", when: "Facility state is MA", then: "Hold the claim if any line is missing the supervising PT", source: "supervising licensed physical therapist" },
  { section: "6.1", category: "Authorization", summary: "Select HMO covers 30 visits per plan year, with authorization from visit 13.", when: "Select HMO visit number is 13 or higher", then: "Require authorization before the visit is scheduled", source: "Authorization is required beginning with visit 13" },
  { section: "9.2", category: "Appeals", summary: "Payment disputes must be filed within 180 days of the remittance date.", when: "An underpayment is found on a Cascadia remittance", then: "Set the appeal deadline to remittance date plus 180 days", source: "within 180 days of the remittance date" },
];
const CASCADIA_CANON = buildContract({ ...CASCADIA_RAW, terms: CASCADIA_TERMS }, { file: "Cascadia_Participation_Agreement_2025.pdf", uploaded: "Today" });

const SUMMIT = buildContract({
  contract: { id: "summit", masterPayer: "Summit Care Alliance", provider: "Ridgeline Physical Therapy Group", effectiveStart: "2024-07-01", effectiveEnd: "2027-06-30", escalatorPct: null, escalatorStart: null, ptaPct: 100, disputeDays: 150 },
  plans: [{ payer: "Summit Commercial", payerGroup: "Commercial", planType: "PPO", plan: "Summit PPO", method: "percent_of_fee_schedule", discountPct: 82, feeSchedule: "C", facilities: "All facilities", states: "CT, MA, RI", escalates: false, source: "" }],
  feeSchedules: { C: FS_MEDICARE },
  terms: [
    { section: "3.2", category: "License", summary: "Services by a PTA are paid at 100% of the contracted rate.", when: "Claim line has modifier CQ", then: "Pay 100% of the contracted rate", source: "" },
    { section: "8.1", category: "Appeals", summary: "Payment disputes must be filed within 150 days of the remittance date.", when: "An underpayment is found on a Summit remittance", then: "Set the appeal deadline to remittance date plus 150 days", source: "" },
  ],
}, { file: "Summit_Care_Agreement_2024.pdf", uploaded: "Mar 2026" });

const KEYSTONE = buildContract({
  contract: { id: "keystone", masterPayer: "Keystone Health Partners", provider: "Ridgeline Physical Therapy Group", effectiveStart: "2025-04-01", effectiveEnd: "2027-03-31", escalatorPct: null, escalatorStart: null, ptaPct: 100, disputeDays: 120 },
  plans: [{ payer: "Keystone Medicaid", payerGroup: "Medicaid", planType: "Medicaid managed care", plan: "Keystone Medicaid", method: "per_unit", feeSchedule: "M", facilities: "Hartford, Stamford", states: "CT", escalates: false, source: "" }],
  feeSchedules: { M: FS_MEDICAID },
  terms: [{ section: "7.4", category: "Appeals", summary: "Payment disputes must be filed within 120 days of the remittance date.", when: "An underpayment is found on a Keystone remittance", then: "Set the appeal deadline to remittance date plus 120 days", source: "" }],
}, { file: "Keystone_Medicaid_Addendum_2025.pdf", uploaded: "Mar 2026" });

const CANON = { cascadia: CASCADIA_CANON, summit: SUMMIT, keystone: KEYSTONE };

/* ---------- expected allowed engine ---------- */
function calcUnit(row, contract, dos, on, cq) {
  const steps = [];
  let v;
  if (row.method === "percent_of_fee_schedule") {
    if (row.base == null) { steps.push({ k: "miss", label: `${row.discount}% of ${row.basis || "a fee schedule"}`, note: "That fee schedule is not in this contract", value: null }); return { steps, amount: null }; }
    steps.push({ k: "fs", label: `Fee schedule, CPT ${row.cpt}`, note: row.basisResolved ? "Loaded schedule: " + row.basisResolved : "Contract exhibit", value: row.base });
    v = r2((row.base * row.discount) / 100);
    steps.push({ k: "disc", label: `Contracted rate, ${row.discount}% of fee schedule`, note: `${fmt(row.base)} x ${row.discount}%`, value: v });
  } else if (row.method === "percent_of_billed_charges") {
    steps.push({ k: "billed", label: `${row.discount}% of billed charges`, note: "Depends on the billed amount of each claim", value: null }); return { steps, amount: null };
  } else if (row.method === "per_visit") {
    v = row.flat; steps.push({ k: "flat", label: "Flat visit rate", note: "Paid once per visit", value: v });
  } else if (row.base == null && row.flat != null) {
    v = row.flat; steps.push({ k: "flat", label: METHOD[row.method] || "Contracted rate", note: "As written in the contract", value: v });
  } else if (row.base == null) {
    steps.push({ k: "na", label: "No rate found for this row", note: "", value: null }); return { steps, amount: null };
  } else {
    v = row.base; steps.push({ k: "unit", label: `Contracted unit rate, CPT ${row.cpt}`, note: "Per 15 minute unit", value: v });
  }
  if (row.escalates && contract.escalatorPct && contract.escalatorStart && dos >= contract.escalatorStart) {
    const active = !!on[contract.id + ":escalator"];
    const nv = active ? r2(v * (1 + contract.escalatorPct / 100)) : v;
    steps.push({ k: "esc", rule: "escalator", label: `Annual escalator, +${contract.escalatorPct}%`, note: `Applies to service dates from ${fmtDate(contract.escalatorStart)}`, value: nv, active });
    v = nv;
  }
  if (cq && contract.ptaPct != null && row.method !== "per_visit") {
    const active = !!on[contract.id + ":pta"];
    const nv = active ? r2((v * contract.ptaPct) / 100) : v;
    steps.push({ k: "pta", rule: "pta", label: `PTA services (modifier CQ), paid at ${contract.ptaPct}%`, note: "Applies when a PTA delivers the service", value: nv, active });
    v = nv;
  }
  return { steps, amount: v };
}
const findRow = (contract, claim, cpt) => {
  const rows = contract.rows.filter((r) => r.plan.toLowerCase().includes(claim.planKey));
  return rows.find((r) => r.cpt === cpt) || rows.find((r) => r.method === "per_visit") || null;
};
function expectedLines(claim, contract, on) {
  return claim.lines.map((l, i) => {
    const row = findRow(contract, claim, l.cpt);
    if (!row) return null;
    if (row.method === "per_visit") return i === 0 ? calcUnit(row, contract, claim.dos, on, false).amount : 0;
    return r2(calcUnit(row, contract, claim.dos, on, l.cq).amount * l.units);
  });
}

/* ---------- synthetic claims ---------- */
const PLAN_META = {
  choice: { plan: "Choice PPO", master: "Cascadia Mutual Health", contractId: "cascadia", group: "Commercial", w: 30 },
  select: { plan: "Select HMO", master: "Cascadia Mutual Health", contractId: "cascadia", group: "Commercial", w: 12 },
  senior: { plan: "Senior Plus", master: "Cascadia Mutual Health", contractId: "cascadia", group: "Medicare", w: 12 },
  summit: { plan: "Summit PPO", master: "Summit Care Alliance", contractId: "summit", group: "Commercial", w: 30 },
  keystone: { plan: "Keystone Medicaid", master: "Keystone Health Partners", contractId: "keystone", group: "Medicaid", w: 16 },
};
const ALL5 = ["choice", "select", "senior", "summit", "keystone"];
const FACILITIES = [
  { name: "Hartford", state: "CT", plans: ALL5 }, { name: "Stamford", state: "CT", plans: ALL5 },
  { name: "Springfield", state: "MA", plans: ["choice", "senior", "summit"] }, { name: "Worcester", state: "MA", plans: ["choice", "senior", "summit"] },
  { name: "Providence", state: "RI", plans: ["summit"] },
];
const ON_ALL = { "cascadia:escalator": true, "cascadia:pta": true, "summit:pta": true };
const ON_NOESC = { "cascadia:escalator": false, "cascadia:pta": true, "summit:pta": true };
const HERO_ID = "CLM-26-30418";

function makeClaim(i, forced) {
  const rnd = rng32(1000 + i * 31);
  const f = forced || {};
  const fac = f.facility ? FACILITIES.find((x) => x.name === f.facility) : FACILITIES[Math.floor(rnd() * FACILITIES.length)];
  let planKey = f.planKey;
  if (!planKey) {
    const tot = fac.plans.reduce((s, k) => s + PLAN_META[k].w, 0); let x = rnd() * tot;
    for (const k of fac.plans) { x -= PLAN_META[k].w; if (x <= 0) { planKey = k; break; } }
    planKey = planKey || fac.plans[0];
  }
  const dos = f.dos || addDays("2026-05-01", Math.floor(rnd() * 183));
  const a = rnd();
  const apptType = f.apptType || (a < 0.1 ? "Evaluation" : a < 0.8 ? "Follow-up" : a < 0.9 ? "Re-evaluation" : "Discharge");
  let lineSpec = f.lines;
  if (!lineSpec) {
    if (apptType === "Evaluation") lineSpec = [["97161", 1]].concat(rnd() < 0.5 ? [["97140", 1]] : []);
    else {
      const pool = ["97110", "97140", "97530", "97112"].sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 3));
      lineSpec = pool.map((c) => [c, c === "97110" ? 1 + Math.floor(rnd() * 3) : 1 + Math.floor(rnd() * 2)]);
    }
  }
  const cqOn = f.cq != null ? f.cq : apptType !== "Evaluation" && rnd() < 0.3;
  const meta = PLAN_META[planKey];
  const claim = {
    id: f.id || `CLM-26-${30000 + i * 7}`, patient: f.patient || String.fromCharCode(65 + Math.floor(rnd() * 26)) + "." + String.fromCharCode(65 + Math.floor(rnd() * 26)) + ".",
    pid: f.pid || "PT-" + (40000 + Math.floor(rnd() * 9999)), dos, facility: fac.name, state: fac.state, planKey, plan: meta.plan, master: meta.master, contractId: meta.contractId, group: meta.group,
    apptType, cq: cqOn, remitDate: f.remit || addDays(dos, 21 + Math.floor(rnd() * 10)), remitId: "835-" + (700000 + i * 13),
    lines: lineSpec.map(([cpt, units]) => ({ cpt, units, cq: cqOn && cpt !== "97161", billed: CHARGE[cpt] * units })),
  };
  const contract = CANON[claim.contractId];
  const truth = expectedLines(claim, contract, ON_ALL);
  let pattern = null;
  let paid = truth.slice();
  const roll = rnd();
  if ((planKey === "choice" || planKey === "select") && dos < "2026-10-01" && (f.pattern === "escalator" || roll < 0.6)) { pattern = "escalator"; paid = expectedLines(claim, contract, ON_NOESC); }
  else if (planKey === "summit" && claim.lines.some((l) => l.cq) && (f.pattern === "pta" || roll < 0.55)) { pattern = "pta"; paid = truth.map((t, k) => (claim.lines[k].cq ? r2(t * 0.85) : t)); }
  else if (planKey === "keystone" && claim.lines.some((l) => l.cpt === "97110") && claim.lines.some((l) => l.cpt === "97530")) { pattern = "bundling"; paid = truth.map((t, k) => (claim.lines[k].cpt === "97530" ? 0 : t)); }
  claim.lines.forEach((l, k) => { l.paid = paid[k]; });
  claim.pattern = pattern;
  claim.billed = claim.lines.reduce((s, l) => s + l.billed, 0);
  claim.paid = r2(claim.lines.reduce((s, l) => s + l.paid, 0));
  return claim;
}
const HERO = makeClaim(0, { id: HERO_ID, patient: "M.O.", pid: "PT-48213", dos: "2026-08-14", facility: "Hartford", planKey: "choice", apptType: "Follow-up", lines: [["97110", 3], ["97140", 1], ["97530", 2]], cq: false, remit: "2026-09-08", pattern: "escalator" });
const CLAIMS = [HERO, ...Array.from({ length: 169 }, (_, i) => makeClaim(i + 1))];

const PATTERN = {
  escalator: { prob: 0.92, short: "Escalator not applied", carc: "CO-45" },
  pta: { prob: 0.74, short: "PTA rate cut applied", carc: "CO-45" },
  bundling: { prob: 0.31, short: "Payer edit on 97530", carc: "CO-97" },
};
function derive(claim, contracts, ruleOn, appeals) {
  const contract = contracts.find((c) => c.id === claim.contractId) || null;
  const d = { ...claim, contract, status: "no_contract", expected: null, variance: 0, lineExp: [], deadline: null, daysLeft: null, prob: 0, recover: 0, level: "", reason: "", appeal: appeals[claim.id] || null };
  if (!contract) return d;
  d.lineExp = expectedLines(claim, contract, ruleOn);
  d.expected = r2(d.lineExp.reduce((s, x) => s + (x || 0), 0));
  const v = r2(d.expected - claim.paid);
  d.status = v > 0.5 ? "underpaid" : "ok";
  d.deadline = addDays(claim.remitDate, contract.disputeDays || 180);
  d.daysLeft = daysBetween(TODAY, d.deadline);
  if (d.status === "underpaid") {
    d.variance = v;
    const p = PATTERN[claim.pattern] || { prob: 0.5 };
    d.prob = d.daysLeft < 0 ? 0 : p.prob;
    d.recover = r2(v * d.prob);
    d.level = d.daysLeft < 0 ? "Closed" : d.prob >= 0.8 ? "High" : d.prob >= 0.5 ? "Medium" : "Low";
    const esc = contract.terms.find((t) => t.ruleKey === "escalator"), pta = contract.terms.find((t) => t.ruleKey === "pta");
    if (claim.pattern === "escalator") d.reason = `Section ${esc ? esc.section : "4.3"} raises the contracted rate ${contract.escalatorPct}% from ${fmtDate(contract.escalatorStart)}. The payer paid the 2025 rate.`;
    else if (claim.pattern === "pta") d.reason = `Contract pays PTA services at 100% of the rate. The payer reduced CQ lines to 85%.`;
    else if (claim.pattern === "bundling") d.reason = "The payer denied 97530 with a bundling edit (CO-97). The contract is silent on bundling, so this is a policy dispute.";
    else d.reason = "Paid amount is below the contracted rate.";
  }
  return d;
}

/* ---------- Claude calls ---------- */
async function callClaude(system, content) {
  // In this repo the browser never holds an API key: requests go to the serverless function in /api/claude.js
  const r = await fetch("/api/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
  });
  if (!r.ok) throw new Error("api " + r.status);
  const d = await r.json();
  return (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}
function parseJSON(t) {
  const c = t.replace(/```json|```/g, "").trim();
  return JSON.parse(c.slice(c.indexOf("{"), c.lastIndexOf("}") + 1));
}
const SYS_PARSE = "You extract structured data from healthcare provider and payer contracts. Reply with minified JSON only. No markdown, no commentary.";
const PROMPT_A = `Extract the compensation structure from this contract. Return JSON with this exact shape: {"contract":{"masterPayer":string,"provider":string,"effectiveStart":"YYYY-MM-DD","effectiveEnd":"YYYY-MM-DD","escalatorPct":number or null,"escalatorStart":"YYYY-MM-DD" or null,"ptaPct":number or null,"disputeDays":number or null},"plans":[{"payer":string,"payerGroup":"Commercial" or "Medicare" or "Medicaid","planType":string,"plan":string,"method":"percent_of_fee_schedule" or "per_visit" or "per_unit","discountPct":number or null,"flatRate":number or null,"maxUnits":number or null,"feeSchedule":"B" or "C" or null,"facilities":string,"states":string,"escalates":boolean,"source":"an exact phrase of 5 to 9 words copied from the contract"}],"feeSchedules":{"B":{"97110":number,"97140":number,"97530":number,"97112":number,"97161":number},"C":{"97110":number,"97140":number,"97530":number,"97112":number,"97161":number}}}. The feeSchedule field is the exhibit letter whose amounts the plan uses. The plan field is the short plan name without the payer prefix, for example Choice PPO.`;
const PROMPT_B = `List the contract terms that affect payment, authorization, licensure, state rules or disputes. Return JSON: {"terms":[{"section":string,"category":"Rate" or "License" or "State" or "Authorization" or "Appeals","summary":"under 15 words","when":"under 14 words, the condition","then":"under 14 words, the action","source":"an exact phrase of 4 to 8 words copied from the contract"}]}. Include at most 6 terms.`;

function validA(a) {
  try {
    if (!a || !Array.isArray(a.plans) || !a.plans.length || !a.contract) return false;
    return a.plans.every((p) => ["percent_of_fee_schedule", "per_visit", "per_unit"].includes(p.method) && /choice|select|senior/i.test(p.plan || "") &&
      (p.method === "per_visit" ? num(p.flatRate) != null : a.feeSchedules && a.feeSchedules[p.feeSchedule] && CPT_LIST.every((c) => num(a.feeSchedules[p.feeSchedule][c]) != null) && (p.method === "per_unit" || num(p.discountPct) != null)));
  } catch (e) { return false; }
}
function normA(a) {
  const c = a.contract;
  return {
    contract: { id: "cascadia", masterPayer: c.masterPayer || "Cascadia Mutual Health", provider: c.provider || "", effectiveStart: c.effectiveStart, effectiveEnd: c.effectiveEnd, escalatorPct: num(c.escalatorPct), escalatorStart: c.escalatorStart || null, ptaPct: num(c.ptaPct), disputeDays: num(c.disputeDays) || 180 },
    plans: a.plans.map((p) => ({ ...p, discountPct: num(p.discountPct), flatRate: num(p.flatRate), maxUnits: num(p.maxUnits), escalates: !!p.escalates })),
    feeSchedules: a.feeSchedules,
  };
}
const validB = (b) => b && Array.isArray(b.terms) && b.terms.length > 0 && b.terms.every((t) => t.section && t.summary);

function computeMarks(text, sources) {
  const marks = [];
  sources.forEach((s, idx) => {
    if (!s) return;
    const low = text.toLowerCase();
    let i = low.indexOf(s.toLowerCase());
    let len = s.length;
    if (i < 0) { const w = s.split(/\s+/).slice(0, 4).join(" "); i = low.indexOf(w.toLowerCase()); len = w.length; }
    if (i >= 0) marks.push({ start: i, end: i + len, idx });
  });
  return marks.sort((a, b) => a.start - b.start).filter((m, k, arr) => k === 0 || m.start >= arr[k - 1].end);
}

/* ---------- small UI ---------- */
const Chip = ({ tone = "", children }) => <span className={"chip " + tone}>{children}</span>;
const Switch = ({ on, onChange, label, disabled }) => (
  <button role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={"sw" + (on ? " on" : "")} onClick={() => onChange(!on)}><span /></button>
);
const levelTone = { High: "moss", Medium: "amber", Low: "grey", Closed: "rust" };

/* ============================================================
   Doc viewer
   ============================================================ */
function resolveAnchor(text, needle, nth = 0, toEol = false) {
  if (!text || !needle) return null;
  const low = text.toLowerCase(); const nd = needle.toLowerCase();
  let i = -1, from = 0;
  for (let k = 0; k <= nth; k++) { i = low.indexOf(nd, from); if (i < 0) break; from = i + nd.length; }
  let len = needle.length;
  if (i < 0 && nth > 0) return resolveAnchor(text, needle, 0, toEol);
  if (i < 0) { const w = needle.split(/\s+/).slice(0, 4).join(" "); i = low.indexOf(w.toLowerCase()); len = w.length; }
  if (i < 0) return null;
  let end = i + len;
  if (toEol) { const nl = text.indexOf("\n", end); end = nl < 0 ? text.length : nl; }
  return { start: i, end };
}

function DocPane({ text, marks = [], activeIdx = -1, shownIdx = [], nonce = 0, title, pdfName, zoom = 100 }) {
  const cont = useRef(null);
  const act = useRef(null);
  useEffect(() => {
    const c = cont.current, m = act.current;
    if (!c || !m) return;
    const top = m.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - c.clientHeight / 3;
    if (c.scrollTo) c.scrollTo({ top: Math.max(0, top), behavior: "smooth" }); else c.scrollTop = Math.max(0, top);
  }, [activeIdx, nonce]);
  if (text == null) return (
    <div className="docscroll" ref={cont}><div className="paper pdfcard"><FileText size={28} /><div className="b">{pdfName}</div><div className="muted">PDF sent to Claude for reading. Page preview is not available in this prototype, so selecting a row cannot scroll the document.</div></div></div>
  );
  const parts = []; let pos = 0;
  marks.forEach((m, k) => {
    if (m.start > pos) parts.push(<span key={"t" + k}>{text.slice(pos, m.start)}</span>);
    const shown = shownIdx.includes(m.idx) || m.idx === activeIdx;
    parts.push(<mark key={"m" + k} ref={m.idx === activeIdx ? act : null} className={m.idx === activeIdx ? "hl active" : shown ? "hl" : "hl off"}>{text.slice(m.start, m.end)}</mark>);
    pos = m.end;
  });
  parts.push(<span key="end">{text.slice(pos)}</span>);
  return (
    <div className="docscroll" ref={cont}>
      <div className="paper">{title ? <div className="paper-title">{title}</div> : null}<div className="paper-body" style={{ fontSize: 13 * zoom / 100 }}>{parts}</div></div>
    </div>
  );
}


/* ============================================================
   PDF viewing and reading (pdf.js from cdnjs, loaded on demand)
   ============================================================ */
const PDFJS_VER = "3.11.174";
const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VER}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VER}/pdf.worker.min.js`;
let pdfjsPromise = null;
function loadPdfJs() {
  if (typeof window === "undefined" || window.__NO_PDFJS__) return Promise.resolve(null);
  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    return Promise.resolve(window.pdfjsLib);
  }
  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = PDFJS_URL; s.async = true;
      const to = setTimeout(() => resolve(null), 9000);
      s.onload = () => { clearTimeout(to); const lib = window.pdfjsLib; if (lib) { if (!lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; resolve(lib); } else resolve(null); };
      s.onerror = () => { clearTimeout(to); resolve(null); };
      document.head.appendChild(s);
    }).then((v) => { if (!v) pdfjsPromise = null; return v; });
  }
  return pdfjsPromise;
}
const b64ToBytes = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
const normStr = (s) => String(s || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, " ").trim();
const firstWords = (s, n) => String(s || "").split(/\s+/).slice(0, n).join(" ");

function lineify(items) {
  const rows = [];
  [...items].filter((i) => i.str.trim()).sort((a, b) => a.y - b.y || a.x - b.x).forEach((it) => {
    const last = rows[rows.length - 1];
    if (last && Math.abs(last.y - it.y) < 3) last.items.push(it); else rows.push({ y: it.y, items: [it] });
  });
  return rows.map((r) => r.items.sort((a, b) => a.x - b.x).map((i) => i.str.trim()).join("  ")).join("\n");
}
async function indexPdf(pdf, onProgress) {
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const vp = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const items = [];
    for (const it of tc.items) {
      if (typeof it.str !== "string" || !it.str) continue;
      const t = it.transform; const fh = Math.hypot(t[2], t[3]) || it.height || 10;
      items.push({ str: it.str, x: t[4], y: vp.height - t[5], top: vp.height - t[5] - fh, w: it.width, h: fh });
    }
    let norm = ""; const mi = [], mc = [];
    items.forEach((it, k) => {
      const s = it.str;
      for (let c = 0; c < s.length; c++) {
        let ch = s[c].toLowerCase();
        if (ch === "\u2019" || ch === "\u2018") ch = "'"; else if (ch === "\u201c" || ch === "\u201d") ch = '"'; else if (/\s/.test(ch)) ch = " ";
        if (ch === " " && (norm === "" || norm.endsWith(" "))) continue;
        norm += ch; mi.push(k); mc.push(c);
      }
      if (norm && !norm.endsWith(" ")) { norm += " "; mi.push(k); mc.push(s.length); }
    });
    pages.push({ n, w: vp.width, h: vp.height, items, norm, mi, mc, text: lineify(items) });
    if (onProgress && n % 10 === 0) onProgress(n, pdf.numPages);
  }
  return { pages, hasText: pages.some((p) => p.norm.length > 40) };
}
function spanRects(p, a, b, toEol) {
  const i0 = p.mi[a], i1 = p.mi[Math.max(a, b - 1)];
  const rects = [];
  for (let k = i0; k <= i1; k++) {
    const it = p.items[k]; const len = it.str.length || 1;
    const sc = k === i0 ? p.mc[a] : 0, ec = k === i1 ? Math.min(len, p.mc[Math.max(a, b - 1)] + 1) : len;
    rects.push({ left: it.x + (it.w * sc) / len, top: it.top, width: Math.max(2, (it.w * (ec - sc)) / len), height: it.h });
  }
  if (toEol) {
    const base = p.items[i1];
    for (let k = i1 + 1; k < p.items.length && Math.abs(p.items[k].y - base.y) < 3; k++) { const it = p.items[k]; rects.push({ left: it.x, top: it.top, width: it.w, height: it.h }); }
  }
  return rects;
}
function findInIndex(idx, needle, nth = 0, prefer = null, toEol = false) {
  const nd = normStr(needle);
  if (!idx || !nd) return null;
  const all = idx.pages.map((_, i) => i);
  let order = all;
  if (prefer != null && idx.pages[prefer - 1]) order = [prefer - 1, ...all.filter((i) => i !== prefer - 1)];
  let count = 0;
  for (const pi of order) {
    const p = idx.pages[pi]; let from = 0;
    while (true) {
      const at = p.norm.indexOf(nd, from);
      if (at < 0) break;
      if (count === nth) return { page: p.n, rects: spanRects(p, at, at + nd.length, toEol) };
      count++; from = at + nd.length;
    }
  }
  return null;
}
const RATE_KW = /per diem|case rate|fee schedule|rate schedule|billing codes|reimburse|compensation|per unit|per visit|hcpc|cpt4?\b|revenue codes?|per service date|allowed amount|billed charges/gi;
function stateRange(texts) {
  const heads = [];
  texts.forEach((t, i) => { if (/state compliance addendum/i.test(t.slice(0, 400))) heads.push(i + 1); });
  if (heads.length < 3) return null;
  const start = heads[0], lastHead = heads[heads.length - 1];
  let end = texts.length;
  for (let n = lastHead + 1; n <= texts.length; n++) {
    if (/(^|\n)\s*(commercial health product addendum|medicare advantage product addendum|medical rental products addendum|behavioral health)/i.test(texts[n - 1].slice(0, 500))) { end = n - 1; break; }
  }
  return { start, end: Math.max(end, lastHead) };
}
function rankPages(texts, sr) {
  const rate = [], term = [];
  texts.forEach((t, i) => {
    const n = i + 1;
    if (sr && n >= sr.start && n <= sr.end) return;
    const dollars = (t.match(/\$\s?\d[\d,]*(?:\.\d+)?/g) || []).length, pct = (t.match(/\d+(?:\.\d+)?\s?%/g) || []).length;
    const kw = (t.match(RATE_KW) || []).length;
    if ((dollars >= 5 && kw >= 1) || (pct >= 3 && kw >= 2) || (kw >= 6 && dollars >= 2)) rate.push(n);
    const tk = (t.match(/timely|within \w+ \(?\d+\)? days|terminat|appeal|dispute|escalat|annual increase|renew|initial term|notice|audit|overpayment|authorization/gi) || []).length;
    if (tk >= 4) term.push({ n, score: tk });
  });
  return { rate, term };
}
async function pool(tasks, limit) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, async () => { while (i < tasks.length) { const k = i++; out[k] = await tasks[k](); } }));
  return out;
}
function parseLoose(t) {
  const c = String(t || "").replace(/```json|```/g, "").trim();
  const a = c.indexOf("{");
  if (a < 0) return null;
  try { return JSON.parse(c.slice(a, c.lastIndexOf("}") + 1)); } catch (e) { /* try to salvage a cut-off list */ }
  const i = c.lastIndexOf("],");
  if (i > 0) { try { return JSON.parse(c.slice(a, i + 1) + "]}"); } catch (e2) { /* give up */ }
  }
  return null;
}
const SYS_GEN = "You extract structured data from healthcare payer and provider contracts. Reply with minified JSON only. No markdown, no commentary. Copy phrases exactly as they appear in the text.";
const P_HEADER = `Read the opening pages of this contract. Return JSON: {"masterPayer":string,"provider":string,"effectiveStart":"YYYY-MM-DD" or null,"effectiveEnd":"YYYY-MM-DD" or null,"products":[string],"disputeDays":number or null,"filingDays":number or null}. masterPayer is the payer organization or brand, provider is the contracting provider group or facility, products are the lines of business covered, filingDays is the timely filing limit in days, disputeDays is the window in days to dispute a payment.`;
const P_RATES = `This is one page of a contract. If it contains payment rates, return JSON: {"sched":string or null,"rows":[[service,codes,method,amount,pct,basis,year,product,src]]}. sched is the rate schedule title on the page. service is the service name. codes is the billing codes as written, shortened to 60 characters, or null. method is one of case_rate, per_diem, per_code, per_unit, per_visit, percent_of_fee_schedule, percent_of_billed_charges, other. amount is a dollar number or null. pct is a percent number or null. basis is the named fee schedule a percentage applies to, or null. year is the rate year as an integer if the page says Year 1, 2 or 3, else null. product is the product or line of business, or "All Products". src is an exact phrase of 3 to 8 words copied from the page that identifies the row. Return at most 22 rows. If the page has no rates return {"sched":null,"rows":[]}.`;
const P_TERMS = `These are pages of a contract. Return JSON: {"terms":[[section,category,summary,src]]}. List terms about timely filing, payment disputes and appeals, term and termination, renewal, rate changes or escalators, license or state rules, authorization, audits and overpayments. category is one of Filing, Appeals, Termination, Rate, License, State, Authorization, Audit, Other. summary is under 18 words and includes any number of days. src is an exact phrase of 4 to 8 words copied from the text. At most 6 terms.`;
const GEN_METHODS = ["case_rate", "per_diem", "per_code", "per_unit", "per_visit", "percent_of_fee_schedule", "percent_of_billed_charges", "other"];
const groupOf = (s) => (/medicare/i.test(s || "") ? "Medicare" : /medicaid/i.test(s || "") ? "Medicaid" : /all products/i.test(s || "") ? "All" : "Commercial");
const unitSuffix = (r) => ({ per_visit: "per visit", per_diem: "per diem", case_rate: "per case", per_code: "per code per day" }[r.method] || "per unit");
function rowFrom(a, sched, page) {
  if (!Array.isArray(a) || !a[0]) return null;
  const [service, codes, method, amount, pct, basis, year, product, src] = a;
  return { service: String(service), codes: codes ? String(codes) : null, method: GEN_METHODS.includes(method) ? method : "other", amount: num(amount), pct: num(pct), basis: basis ? String(basis) : null, year: num(year), product: product ? String(product) : "All Products", src: src ? String(src) : String(service), sched: sched || null, page };
}
function buildGeneric(g, s) {
  const h = g.header || {};
  const hash = String(s.name || "x").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7) + (s.size || 0);
  const id = slug(h.masterPayer || "contract") + "-" + (hash % 10000);
  const c = {
    id, kind: "generic", masterPayer: h.masterPayer || "Unknown payer", provider: h.provider || "", effectiveStart: h.effectiveStart || null, effectiveEnd: h.effectiveEnd || null,
    escalatorPct: null, escalatorStart: null, ptaPct: null, disputeDays: num(h.disputeDays) || 180, filingDays: num(h.filingDays), file: s.name, uploaded: "Today", bytes: s.bytes || null, meta: g.meta,
  };
  c.number = "CTR-" + String(c.effectiveStart || "2026").slice(0, 4) + "-" + String(100 + (hash % 900)).padStart(4, "0");
  c.rows = g.rows.map((r, i) => ({
    id: `${id}-r${i}`, contractId: id, payer: c.masterPayer, payerGroup: groupOf(r.product), planType: r.sched || "Rate schedule", plan: r.product, svc: r.service, cpt: r.codes || "n/a",
    method: r.method, base: null, discount: r.pct, flat: r.amount, basis: r.basis, facility: "All facilities", state: "", units: unitSuffix(r), apptType: "All", year: r.year,
    start: c.effectiveStart, end: c.effectiveEnd, escalates: false, source: r.src, page: r.page,
  }));
  c.plans = [...new Set(c.rows.map((r) => r.plan))].map((p) => ({ payer: c.masterPayer, payerGroup: groupOf(p), planType: "", plan: p, method: "multiple", source: "" }));
  c.terms = g.terms.map((t, i) => ({ id: `${id}-t${i}`, section: t.section, category: t.category, summary: t.summary, source: t.src, page: t.page, ruleKey: null }));
  return c;
}
function qaGeneric(c) {
  const m = c.meta, checks = [], reviews = [];
  const years = [...new Set(c.rows.map((r) => r.year).filter((y) => y != null))].sort().join(", ");
  const prods = [...new Set(c.rows.map((r) => r.plan))];
  checks.push({ id: "h", label: "Payer and provider", detail: `${c.masterPayer}${c.provider ? ", contracting with " + c.provider : ""}, ${prods.length} product${prods.length === 1 ? "" : "s"}`, ok: c.masterPayer !== "Unknown payer", anchor: { needle: c.masterPayer, nth: 0, page: 1 } });
  checks.push({ id: "r", label: "Rates found", detail: `${c.rows.length} rate rows${years ? ", rate years " + years : ""}`, ok: c.rows.length > 0 });
  checks.push({ id: "d", label: "Effective dates", detail: c.effectiveStart ? `${fmtDate(c.effectiveStart)}${c.effectiveEnd ? " to " + fmtDate(c.effectiveEnd) : ", no end date stated"}` : "No effective date found in the opening pages", ok: !!c.effectiveStart, anchor: { needle: "Effective Date", nth: 0, page: 1 } });
  if (m.failedRate.length) checks.push({ id: "f", label: "Pages that could not be read", detail: `Page${m.failedRate.length > 1 ? "s" : ""} ${m.failedRate.slice(0, 12).join(", ")}`, ok: false, action: { label: "Read again" } });
  const unread = m.rateCands.length - m.readRate.length;
  if (unread > 0) reviews.push({ id: "cov", label: `Rates read from ${m.readRate.length} of ${m.rateCands.length} rate pages`, detail: `The other ${unread} pages may hold more years or services. Read them before relying on these rates.`, anchor: null, action: { label: `Read ${Math.min(8, unread)} more` } });
  const bases = {};
  c.rows.forEach((r) => { if (r.method === "percent_of_fee_schedule" && r.base == null && r.basis) { (bases[r.basis] = bases[r.basis] || { n: 0, r }).n++; } });
  Object.entries(bases).slice(0, 5).forEach(([b, v]) => reviews.push({ id: "b" + slug(b), label: `Fee schedule not in this document: ${b}`, detail: `${v.n} rows are paid as a percent of it, so expected allowed cannot be calculated until it is loaded.`, anchor: { needle: v.r.source, nth: 0, page: v.r.page } }));
  if (m.stateAddenda > 0) reviews.push({ id: "st", label: `State addenda not read (${m.stateAddenda} pages)`, detail: "State addenda can override the terms and rates for those states.", anchor: null });
  return { checks, reviews };
}
function usePdfView(bytes) {
  const [v, setV] = useState({ status: bytes ? "loading" : "none" });
  useEffect(() => {
    let dead = false, doc = null;
    if (!bytes) { setV({ status: "none" }); return; }
    (async () => {
      const lib = await loadPdfJs();
      if (!lib) { if (!dead) setV({ status: "none" }); return; }
      try { doc = await lib.getDocument({ data: bytes.slice(0) }).promise; const index = await indexPdf(doc); if (!dead) setV({ status: "ready", pdf: doc, index }); } catch (e) { if (!dead) setV({ status: "none" }); }
    })();
    return () => { dead = true; if (doc && doc.destroy) { try { doc.destroy(); } catch (e) { /* ignore */ } } };
  }, [bytes]);
  return v;
}
function useWidth(ref) {
  const [w, setW] = useState(560);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setW(el.clientWidth || 560));
    ro.observe(el); setW(el.clientWidth || 560);
    return () => ro.disconnect();
  }, []);
  return w;
}
const PageBox = React.memo(function PageBox({ n, pdf, w, h, scale, rootRef, rects }) {
  const wrap = useRef(null), canvas = useRef(null), task = useRef(null), on = useRef(false);
  useEffect(() => {
    const root = rootRef.current, el = wrap.current;
    if (!root || !el || typeof IntersectionObserver === "undefined") return;
    let dead = false;
    async function draw() {
      if (on.current) return; on.current = true;
      try {
        const page = await pdf.getPage(n); if (dead || !on.current) return;
        const dpr = window.devicePixelRatio || 1; const vp = page.getViewport({ scale: scale * dpr }); const c = canvas.current; if (!c) return;
        c.width = vp.width; c.height = vp.height; c.style.width = w * scale + "px"; c.style.height = h * scale + "px";
        task.current = page.render({ canvasContext: c.getContext("2d"), viewport: vp }); await task.current.promise;
      } catch (e) { /* cancelled */ }
    }
    function undraw() { on.current = false; if (task.current) { try { task.current.cancel(); } catch (e) { /* ignore */ } } const c = canvas.current; if (c) { c.width = 1; c.height = 1; } }
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? draw() : undraw())), { root, rootMargin: "1400px 0px" });
    io.observe(el);
    return () => { dead = true; io.disconnect(); undraw(); };
  }, [scale, pdf, n]);
  return (
    <div ref={wrap} className="pdfpage" data-page={n} style={{ width: w * scale, height: h * scale }}>
      <canvas ref={canvas} />
      {rects.map((r, i) => <div key={i} className={"pdfhl" + (r.strong ? " strong" : "")} style={{ left: r.left * scale, top: r.top * scale, width: r.width * scale, height: r.height * scale }} />)}
    </div>
  );
});
function PdfPane({ pdf, index, rectsByPage, focusPage, nonce = 0, zoom = 100, contRef, onPage, jump }) {
  const own = useRef(null);
  const cont = contRef || own;
  const width = useWidth(cont);
  const maxW = Math.max(...index.pages.map((p) => p.w), 100);
  const scale = Math.max(0.4, Math.min(3, ((width - 32) / maxW) * (zoom / 100)));
  const offsets = useMemo(() => { let y = 12; return index.pages.map((p) => { const top = y; y += p.h * scale + 12; return top; }); }, [index, scale]);
  const last = useRef(1);
  const scrollTo = (top) => { const c = cont.current; if (!c) return; const far = Math.abs(top - c.scrollTop) > 2500; if (c.scrollTo) c.scrollTo({ top: Math.max(0, top), behavior: far ? "auto" : "smooth" }); else c.scrollTop = Math.max(0, top); };
  const onScroll = () => {
    const c = cont.current; if (!onPage || !c) return;
    const y = c.scrollTop + c.clientHeight / 3; let lo = 0, hi = offsets.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (offsets[m] <= y) lo = m; else hi = m - 1; }
    if (lo + 1 !== last.current) { last.current = lo + 1; onPage(lo + 1); }
  };
  useEffect(() => {
    if (!focusPage || !cont.current) return;
    const strong = (rectsByPage[focusPage] || []).filter((r) => r.strong);
    const y = strong.length ? Math.min(...strong.map((r) => r.top)) * scale : 0;
    scrollTo(offsets[focusPage - 1] + y - cont.current.clientHeight / 3);
  }, [focusPage, nonce]);
  useEffect(() => { if (jump && offsets[jump.page - 1] != null) scrollTo(offsets[jump.page - 1] - 12); }, [jump]);
  return (
    <div className="pdfscroll" ref={cont} onScroll={onScroll}>
      <div className="pdfpages">
        {index.pages.map((p) => <PageBox key={p.n} n={p.n} pdf={pdf} w={p.w} h={p.h} scale={scale} rootRef={cont} rects={rectsByPage[p.n] || []} />)}
      </div>
    </div>
  );
}
function rectsFromHits(softHits, strongHit) {
  const out = {};
  (softHits || []).forEach((h) => { (out[h.page] = out[h.page] || []).push(...h.rects.map((r) => ({ ...r, strong: false }))); });
  if (strongHit) (out[strongHit.page] = out[strongHit.page] || []).push(...strongHit.rects.map((r) => ({ ...r, strong: true })));
  return out;
}

/* ============================================================
   Rates table
   ============================================================ */
function RatesTable({ rows, contractMap, ruleOn, onRow, activeId, compact }) {
  return (
    <div className="tblwrap">
      <table className={"tbl" + (compact ? " compact" : "")}>
        <thead><tr>{COLS.map(([k, l]) => <th key={k} className={RIGHT[k] ? "r" : ""}>{l}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={"clickrow" + (activeId === r.id ? " active" : "")} onClick={() => onRow && onRow(r)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onRow && onRow(r)}>
              {COLS.map(([k]) => <td key={k} className={RIGHT[k] ? "r" : ""}>{CELLS[k](r, contractMap[r.contractId], ruleOn)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   Upload and extraction flow
   ============================================================ */
const STAGES = ["Reading the document", "Identifying payer hierarchy", "Extracting rate methodology", "Reading fee schedule exhibits", "Flagging terms and state rules"];

function qaFor(contract, has) {
  const checks = [], reviews = [];
  const payers = [...new Set(contract.plans.map((p) => p.payer))];
  checks.push({ id: "h", label: "Payer hierarchy", detail: `${contract.masterPayer}, ${payers.length} payer line${payers.length > 1 ? "s" : ""}, ${contract.plans.length} plans`, ok: true, anchor: { needle: contract.masterPayer, nth: 0 } });
  const missing = [];
  contract.plans.forEach((p) => { if (p.method !== "per_visit") CPT_LIST.forEach((c) => { const r = contract.rows.find((x) => x.plan === p.plan && x.cpt === c); if (!r || r.base == null) missing.push(p.plan + " " + c); }); });
  checks.push({ id: "f", label: "Fee schedule load", detail: missing.length ? "Missing: " + missing.join(", ") : `All ${CPT_LIST.length} CPT codes present for every fee schedule plan`, ok: !missing.length, anchor: { needle: "Exhibit B. ", nth: 0 } });
  const odd = contract.plans.filter((p) => (p.method === "percent_of_fee_schedule" && (p.discountPct < 50 || p.discountPct > 130)) || (p.method === "per_visit" && (p.flatRate < 30 || p.flatRate > 150)));
  checks.push({ id: "p", label: "Rate range check", detail: odd.length ? "Outside expected range: " + odd.map((p) => p.plan).join(", ") : "All rates fall inside the expected range for outpatient PT", ok: !odd.length, anchor: { needle: (odd[0] || contract.plans[0]).source, nth: 0 } });
  checks.push({ id: "d", label: "Effective dates", detail: `${fmtDate(contract.effectiveStart)} to ${fmtDate(contract.effectiveEnd)}`, ok: !!contract.effectiveStart && !!contract.effectiveEnd && contract.effectiveEnd > contract.effectiveStart, anchor: { needle: "Effective Date", nth: 0 } });
  contract.plans.forEach((p) => {
    if (p.method === "per_visit") reviews.push({ id: "v" + p.plan, label: `${p.plan}: flat visit rate`, detail: `Claude read ${fmt(p.flatRate)} per visit with a ${p.maxUnits || 4} unit cap. Confirm it replaces per-unit rates.`, anchor: { needle: p.source, nth: 0 } });
    else if (has && p.source && !has(p.source)) reviews.push({ id: "s" + p.plan, label: `${p.plan}: source passage not found`, detail: "The quoted source could not be located in the document. Verify the rate by hand.", anchor: null });
  });
  return { checks, reviews };
}

const STEP_NAMES = ["Upload", "Review and publish"];
const GEN_STEPS = ["Opening the PDF", "Reading the text on every page", "Finding the rate and term pages", "Reading the contract header", "Reading rate pages", "Reading terms and notice periods"];
const SAMPLES = [
  { name: "Cascadia_Participation_Agreement_2025.pdf", size: 4509, b64: SAMPLE_PDF_B64, main: true },
  { name: "Northwind_Provider_Agreement_2025.pdf", size: 3413, b64: SAMPLE_PDF_NW },
  { name: "Harbor_Medicaid_Addendum_2026.pdf", size: 3301, b64: SAMPLE_PDF_HB },
];
let itemSeq = 0;
const mkItem = (f) => ({ id: "f" + ++itemSeq + "-" + Date.now(), name: f.name, size: f.size || 0, bytes: f.bytes || null, text: f.text != null ? f.text : null, sample: !!f.sample, status: "queued", steps: [], stage: 0, viewer: null, result: null, error: null, accepted: {}, more: false });

function Disclosure({ title, count, open, onToggle, children }) {
  return (
    <div className="disc">
      <div className="disc-h">
        <button className="icon" aria-label={(open ? "Collapse " : "Expand ") + title} aria-expanded={open} onClick={onToggle}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
        <button className="disc-t" onClick={onToggle}>{title}</button>
        <span className="tagc">{count}</span>
      </div>
      {open && <div className="disc-b">{children}</div>}
    </div>
  );
}

function PdfReader({ item, rectsByPage, focusPage, nonce }) {
  const { pdf, index } = item.viewer;
  const ZOOMS = [50, 75, 100, 125, 150, 200];
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [pin, setPin] = useState("1");
  const [jump, setJump] = useState(null);
  const [thumbs, setThumbs] = useState(false);
  const cont = useRef(null), wrap = useRef(null);
  useEffect(() => setPin(String(page)), [page]);
  const go = (n) => { const p = Math.max(1, Math.min(index.pages.length, n || 1)); setJump({ page: p, nonce: Date.now() }); };
  const step = (d) => { const i = ZOOMS.indexOf(zoom); setZoom(ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? 2 : i) + d))]); };
  const blobUrl = () => URL.createObjectURL(new Blob([item.bytes], { type: "application/pdf" }));
  const download = () => { if (!item.bytes) return; const url = blobUrl(); const a = document.createElement("a"); a.href = url; a.download = item.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 3000); };
  const print = () => { if (!item.bytes) return; const w = window.open(blobUrl(), "_blank"); if (w && w.addEventListener) w.addEventListener("load", () => { try { w.print(); } catch (e) { /* ignore */ } }); };
  const full = () => { const el = wrap.current; if (el && el.requestFullscreen) el.requestFullscreen().catch(() => {}); };
  return (
    <div className="reader" ref={wrap}>
      <div className="rdbar">
        <button className={"icon" + (thumbs ? " sel" : "")} aria-label="Page list" aria-pressed={thumbs} onClick={() => setThumbs(!thumbs)}><PanelLeft size={18} /></button>
        <span className="vsep" />
        <label className="rdpage"><span className="b">Page</span>
          <input aria-label="Page number" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && go(parseInt(pin, 10))} onBlur={() => setPin(String(page))} />
          <span className="b">/{index.pages.length}</span></label>
        <span className="vsep" />
        <button className="icon" aria-label="Download" onClick={download}><Download size={18} /></button>
        <button className="icon" aria-label="Print" onClick={print}><Printer size={18} /></button>
        <button className="icon" aria-label="Full screen" onClick={full}><Maximize2 size={18} /></button>
        <span className="vsep" />
        <button className="icon" aria-label="Zoom out" onClick={() => step(-1)}><ZoomOut size={18} /></button>
        <select className="zsel" aria-label="Zoom" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>{ZOOMS.map((z) => <option key={z} value={z}>{z}%</option>)}</select>
        <button className="icon" aria-label="Zoom in" onClick={() => step(1)}><ZoomIn size={18} /></button>
      </div>
      <div className="rdbody">
        {thumbs && <div className="thumbs" aria-label="Pages">{index.pages.map((p) => <button key={p.n} className={"thumb" + (page === p.n ? " on" : "")} onClick={() => go(p.n)}>{p.n}</button>)}</div>}
        <PdfPane pdf={pdf} index={index} rectsByPage={rectsByPage} focusPage={focusPage} nonce={nonce} zoom={zoom} contRef={cont} onPage={setPage} jump={jump} />
      </div>
    </div>
  );
}

function AddContractFlow({ mode = "pdf", onCancel, onPublish, setAiHook }) {
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(1);
  const [menu, setMenu] = useState(false);
  const [focus, setFocus] = useState(null);
  const [open, setOpen] = useState({ rates: false, terms: false });
  const [helpful, setHelpful] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [excluded, setExcluded] = useState({});
  const fileRef = useRef(null), moreRef = useRef(null), menuRef = useRef(null);
  const started = useRef(new Set()), pdfs = useRef({}), gens = useRef({});

  const patch = (id, p) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...(typeof p === "function" ? p(x) : p) } : x)));
  useEffect(() => {
    if (!menu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    const k = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [menu]);
  useEffect(() => () => { Object.values(pdfs.current).forEach((d) => { try { d.destroy(); } catch (e) { /* ignore */ } }); }, []);
  useEffect(() => { setFocus(null); setShowAll(false); }, [sel]);

  /* ---------- reading one contract ---------- */
  async function readSpecialized(id, text, s, t0) {
    patch(id, { steps: STAGES, stage: 0 });
    const timer = setInterval(() => patch(id, (x) => ({ stage: Math.min(x.stage + 1, STAGES.length - 1) })), 700);
    const doc = { type: "text", text: "CONTRACT DOCUMENT:\n" + text };
    const ask = async (p) => { try { return { ok: true, data: parseJSON(await callClaude(SYS_PARSE, [doc, { type: "text", text: p }])) }; } catch (e) { return { ok: false }; } };
    const [a, b] = await Promise.all([ask(PROMPT_A), ask(PROMPT_B)]);
    const okA = a.ok && validA(a.data), okB = b.ok && validB(b.data);
    const rawA = okA ? normA(a.data) : CASCADIA_RAW;
    const terms = okB ? b.data.terms.slice(0, 6) : CASCADIA_TERMS;
    const contract = buildContract({ ...rawA, terms }, { file: s.name, uploaded: "Today", bytes: s.bytes || null });
    await sleep(Math.max(0, 3200 - (Date.now() - t0)));
    clearInterval(timer);
    return { contract, kind: "cascadia", liveA: okA, liveB: okB };
  }
  async function readRatePages(g, pages, onTick) {
    let done = 0;
    await pool(pages.map((n) => async () => {
      let j = null;
      try { j = parseLoose(await callClaude(SYS_GEN, [{ type: "text", text: "PAGE " + n + " OF THE CONTRACT:\n" + g.pageTexts[n - 1].slice(0, 9000) }, { type: "text", text: P_RATES }])); } catch (e) { j = null; }
      if (j && Array.isArray(j.rows)) {
        j.rows.forEach((a) => {
          const r = rowFrom(a, j.sched, n); if (!r) return;
          const key = [r.service, r.codes, r.method, r.amount, r.pct, r.year, r.product].join("|");
          if (!g.seen.has(key)) { g.seen.add(key); g.rows.push(r); }
        });
        if (!g.meta.readRate.includes(n)) g.meta.readRate.push(n);
      } else if (!g.meta.failedRate.includes(n)) g.meta.failedRate.push(n);
      done++; if (onTick) onTick(done, pages.length);
    }), 4);
    g.rows.sort((a, b) => a.page - b.page);
  }
  async function readGeneric(id, pageTexts, s) {
    patch(id, { steps: GEN_STEPS, stage: 2 });
    const sr = stateRange(pageTexts);
    const rank = rankPages(pageTexts, sr);
    const stateAddenda = sr ? sr.end - sr.start + 1 : 0;
    const rateSet = new Set(rank.rate);
    const termPages = rank.term.filter((x) => !rateSet.has(x.n)).sort((a, b) => b.score - a.score).slice(0, 6).map((x) => x.n).sort((a, b) => a - b);
    const g = { header: null, rows: [], terms: [], seen: new Set(), pageTexts, meta: { pageCount: pageTexts.length, rateCands: rank.rate, readRate: [], failedRate: [], stateAddenda, termPages } };
    gens.current[id] = g;
    patch(id, { stage: 3 });
    try { g.header = parseLoose(await callClaude(SYS_GEN, [{ type: "text", text: "OPENING PAGES OF THE CONTRACT:\n" + pageTexts.slice(0, 3).join("\n\n").slice(0, 9000) }, { type: "text", text: P_HEADER }])); } catch (e) { g.header = null; }
    const first = rank.rate.slice(0, 8);
    patch(id, (x) => ({ stage: 4, steps: x.steps.map((v, k) => (k === 4 ? `Reading rate pages (0 of ${first.length})` : v)) }));
    await readRatePages(g, first, (d, t) => patch(id, (x) => ({ steps: x.steps.map((v, k) => (k === 4 ? `Reading rate pages (${d} of ${t})` : v)) })));
    patch(id, { stage: 5 });
    const chunks = []; for (let i = 0; i < termPages.length; i += 2) chunks.push(termPages.slice(i, i + 2));
    await pool(chunks.map((ps) => async () => {
      try {
        const j = parseLoose(await callClaude(SYS_GEN, [{ type: "text", text: ps.map((n) => "PAGE " + n + ":\n" + pageTexts[n - 1].slice(0, 7000)).join("\n\n") }, { type: "text", text: P_TERMS }]));
        (j && j.terms ? j.terms : []).forEach((a) => {
          if (!Array.isArray(a) || !a[2]) return;
          const nsrc = normStr(a[3]); const pg = ps.find((n) => normStr(pageTexts[n - 1]).includes(nsrc)) || ps[0];
          g.terms.push({ section: a[0] ? String(a[0]) : "", category: a[1] ? String(a[1]) : "Other", summary: String(a[2]), src: a[3] ? String(a[3]) : "", page: pg });
        });
      } catch (e) { /* terms are optional */ }
    }), 3);
    if (!g.rows.length && !g.header) throw new Error("The AI could not read this contract");
    return { contract: buildGeneric(g, s), kind: "generic", liveA: true, liveB: true };
  }
  async function runItem(it) {
    const id = it.id, t0 = Date.now();
    try {
      let pageTexts = null, fullText = it.text, vw = null;
      if (it.bytes) {
        patch(id, { steps: ["Opening the PDF", "Reading the text on every page"], stage: 0 });
        const lib = await loadPdfJs();
        if (lib) {
          const pdf = await lib.getDocument({ data: it.bytes.slice(0) }).promise;
          pdfs.current[id] = pdf; patch(id, { stage: 1 });
          const index = await indexPdf(pdf);
          vw = { kind: "pdf", pdf, index }; patch(id, { viewer: vw });
          if (!index.hasText) throw new Error("This PDF has no text layer. It looks scanned, and this demo reads text PDFs.");
          pageTexts = index.pages.map((p) => p.text); fullText = pageTexts.join("\n\n");
        } else if (it.sample && it.name === SAMPLES[0].name) { fullText = CONTRACT_TEXT; vw = { kind: "text", text: fullText }; patch(id, { viewer: vw }); }
        else throw new Error("The page viewer could not be loaded in this environment, so this PDF cannot be read page by page.");
      } else { vw = { kind: "text", text: fullText }; patch(id, { viewer: vw }); }
      if (!pageTexts) { pageTexts = []; for (let i = 0; i < fullText.length; i += 3500) pageTexts.push(fullText.slice(i, i + 3500)); }
      const isSample = /cascadia mutual health/i.test(fullText) && /exhibit b/i.test(fullText);
      const out = isSample ? await readSpecialized(id, fullText, it, t0) : await readGeneric(id, pageTexts, it);
      out.contract.pages = vw && vw.kind === "pdf" ? vw.index.pages.length : null;
      patch(id, { status: "done", result: { contract: out.contract, kind: out.kind, liveA: out.liveA, liveB: out.liveB, ms: Date.now() - t0 }, stage: 99 });
    } catch (e) {
      patch(id, { status: "error", error: String((e && e.message) || e) });
    }
  }
  useEffect(() => {
    const reading = items.filter((i) => i.status === "reading").length;
    items.filter((i) => i.status === "queued" && !started.current.has(i.id)).slice(0, Math.max(0, 2 - reading)).forEach((i) => { started.current.add(i.id); patch(i.id, { status: "reading" }); runItem(i); });
  }, [items]);

  async function readMore(id) {
    const g = gens.current[id]; const it = items.find((x) => x.id === id);
    if (!g || !it || it.more) return;
    patch(id, { more: true });
    const next = g.meta.rateCands.filter((n) => !g.meta.readRate.includes(n)).slice(0, 8);
    g.meta.failedRate = g.meta.failedRate.filter((n) => !next.includes(n));
    await readRatePages(g, next);
    patch(id, (x) => ({ more: false, result: { ...x.result, contract: buildGeneric(g, x) } }));
  }

  /* ---------- adding and removing files ---------- */
  const addFiles = (list) => {
    const files = [...list]; if (!files.length) return;
    Promise.all(files.map((f) => new Promise((res) => {
      const rd = new FileReader();
      if (/pdf$/i.test(f.name)) { rd.onload = () => res(mkItem({ name: f.name, size: f.size, bytes: new Uint8Array(rd.result) })); rd.readAsArrayBuffer(f); }
      else { rd.onload = () => res(mkItem({ name: f.name, size: f.size, text: String(rd.result) })); rd.readAsText(f); }
    }))).then((news) => { setItems((p) => [...p, ...news]); setSel((s) => s || news[0].id); });
  };
  const addSamples = () => { const news = SAMPLES.map((s) => mkItem({ name: s.name, size: s.size, bytes: b64ToBytes(s.b64), sample: true })); setItems((p) => [...p, ...news]); setSel((s) => s || news[0].id); };
  const removeItem = (id) => {
    setItems((p) => { const n = p.filter((x) => x.id !== id); if (sel === id) setSel(n[0] ? n[0].id : null); return n; });
    if (pdfs.current[id]) { try { pdfs.current[id].destroy(); } catch (e) { /* ignore */ } delete pdfs.current[id]; }
  };

  /* ---------- derived state for the selected contract ---------- */
  const cur = items.find((i) => i.id === sel) || null;
  const contract = cur && cur.result ? cur.result.contract : null;
  const isGen = !!contract && contract.kind === "generic";
  const viewer = cur ? cur.viewer : null;
  const text = viewer && viewer.kind === "text" ? viewer.text : null;
  const hasFn = (it) => (it.viewer && it.viewer.kind === "pdf" ? (s) => !!findInIndex(it.viewer.index, s) || !!findInIndex(it.viewer.index, firstWords(s, 4)) : it.viewer && it.viewer.kind === "text" ? (s) => computeMarks(it.viewer.text, [s]).length > 0 : null);
  const qaOf = (it) => (it.result ? (it.result.contract.kind === "generic" ? qaGeneric(it.result.contract) : qaFor(it.result.contract, hasFn(it))) : null);
  const qa = useMemo(() => (cur ? qaOf(cur) : null), [cur && cur.result, cur && cur.viewer]);
  const pendingOf = (it) => { const q = it.status === "done" ? qaOf(it) : null; return q ? q.reviews.filter((r) => !it.accepted[r.id]).length : null; };
  const pending = cur && qa ? qa.reviews.filter((r) => !cur.accepted[r.id]).length : 0;
  const sources = contract ? (isGen ? [...contract.rows.map((r) => r.source), ...contract.terms.map((t) => t.source)] : [...contract.plans.map((p) => p.source), ...contract.terms.map((t) => t.source)]) : [];
  const hints = contract ? (isGen ? [...contract.rows.map((r) => r.page), ...contract.terms.map((t) => t.page)] : []) : [];
  const baseMarks = useMemo(() => (text && contract ? computeMarks(text, sources) : []), [text, contract]);
  const textMark = useMemo(() => (focus && text ? resolveAnchor(text, focus.needle, focus.nth, focus.toEol) : null), [focus, text]);
  const marks = textMark ? [...baseMarks.filter((m) => m.end <= textMark.start || m.start >= textMark.end), { ...textMark, idx: 1000 }].sort((x, y) => x.start - y.start) : baseMarks;
  const pdfHit = useMemo(() => (focus && viewer && viewer.kind === "pdf" ? findInIndex(viewer.index, focus.needle, focus.nth, focus.page, focus.toEol) || findInIndex(viewer.index, firstWords(focus.needle, 4), 0, focus.page, focus.toEol) : null), [focus, viewer]);
  const softHits = useMemo(() => (viewer && viewer.kind === "pdf" && contract ? sources.slice(0, 400).map((s, i) => (s ? findInIndex(viewer.index, s, 0, hints[i]) : null)).filter(Boolean) : []), [viewer, contract]);
  const rectsByPage = useMemo(() => rectsFromHits(softHits, pdfHit), [softHits, pdfHit]);
  const cmap = contract ? { [contract.id]: contract } : {};
  const ruleOnPreview = contract ? { [contract.id + ":escalator"]: true, [contract.id + ":pta"]: true } : {};
  const point = (needle, nth, meta = {}) => setFocus({ needle, nth: nth || 0, nonce: Date.now(), ...meta });
  const rowAnchor = (row) => {
    if (isGen) return { needle: row.source, nth: 0, page: row.page };
    const p = contract.plans.find((x) => x.plan === row.plan);
    if (p && p.method !== "per_visit" && p.feeSchedule && /^\d{5}$/.test(row.cpt)) {
      const order = [...new Set(contract.plans.map((x) => x.feeSchedule).filter(Boolean))].sort();
      return { needle: "CPT " + row.cpt, nth: Math.max(0, order.indexOf(p.feeSchedule)), toEol: true };
    }
    return { needle: (p && p.source) || contract.masterPayer, nth: 0 };
  };
  const escTerm = contract && contract.terms.find((t) => t.ruleKey === "escalator");

  useEffect(() => {
    if (!contract) {
      setAiHook({ context: "The user is adding one or more contracts in Air. They can upload several PDFs at once. Claude reads each one: payer, provider, rates (case rates, per diems, flat rates per code, percent of a fee schedule, percent of billed charges), and terms such as timely filing, dispute windows, termination, escalators, license and state rules. For each contract the user reviews QA checks and accepts suggested actions next to the document, then publishes the contracts to the repository together.", prompts: [{ q: "What can I upload here?" }, { q: "What happens after I upload?" }] });
      return;
    }
    if (isGen) {
      const m = contract.meta;
      setAiHook({
        context: `Contract just read: ${contract.masterPayer}, provider ${contract.provider || "unknown"}, effective ${contract.effectiveStart || "unknown"}. ${contract.rows.length} rate rows read from ${m.readRate.length} of ${m.rateCands.length} rate pages out of ${m.pageCount} pages. State addenda pages not read: ${m.stateAddenda}. Rates: ${contract.rows.slice(0, 70).map((r) => `${r.plan} | ${r.svc} | ${r.cpt} | ${METHOD[r.method]} | ${r.flat != null ? "$" + r.flat : r.discount != null ? r.discount + "%" + (r.basis ? " of " + r.basis : "") : "n/a"} | year ${r.year || "n/a"} | page ${r.page}`).join("; ")}. Terms: ${contract.terms.map((t) => `${t.category}: ${t.summary} (page ${t.page})`).join(" | ")}. Suggested actions awaiting the user: ${qa ? qa.reviews.filter((r) => !cur.accepted[r.id]).map((r) => r.label).join("; ") || "none" : "none"}. Contracts in this batch: ${items.map((i) => i.name).join(", ")}.`,
        prompts: [{ q: "Which items need my review?" }, { q: "How does this contract pay?" }, { q: "What are the filing and dispute deadlines?" }],
      });
      return;
    }
    const ctx = `Contract just read: ${contract.masterPayer}, effective ${contract.effectiveStart} to ${contract.effectiveEnd}. Plans: ${contract.plans.map((p) => `${p.plan} (${METHOD[p.method]}${p.discountPct ? " " + p.discountPct + "%" : ""}${p.flatRate ? " $" + p.flatRate : ""})`).join("; ")}. Terms: ${contract.terms.map((t) => `Section ${t.section}: ${t.summary}`).join(" | ")}. Suggested actions awaiting the user: ${qa ? qa.reviews.filter((r) => !cur.accepted[r.id]).map((r) => r.label).join("; ") || "none" : "none"}.` + (text ? "\n\nDocument text:\n" + text : "");
    setAiHook({
      context: ctx,
      prompts: [
        { q: "Which items need my review?" },
        { q: "Show me the escalator clause", act: () => escTerm && point(escTerm.source, 0, { termId: escTerm.id }) },
        { q: "Where do the fee schedules come from?", act: () => point("Exhibit B. ", 0, { toEol: true }) },
      ],
    });
  }, [contract, text, pending, isGen, sel]);

  /* ---------- batch state ---------- */
  const settled = items.length > 0 && items.every((i) => i.status === "done" || i.status === "error");
  const doneItems = items.filter((i) => i.status === "done");
  const included = doneItems.filter((i) => !excluded[i.id]);
  const blocking = included.filter((i) => pendingOf(i) > 0);
  const canContinue = settled && doneItems.length > 0;
  const canPublish = included.length > 0 && blocking.length === 0;
  const idle = items.length === 0;
  const label = (it) => (it.result ? it.result.contract.number : it.name);
  const statusIcon = (it) => {
    if (it.status === "queued" || it.status === "reading") return <Loader2 size={16} className="spin" />;
    if (it.status === "error") return <AlertTriangle size={16} className="neg" />;
    return pendingOf(it) > 0 ? <Circle size={16} /> : <CheckCircle2 size={16} className="okc" />;
  };
  const ratesShown = showAll ? (contract ? contract.rows : []) : (contract ? contract.rows.slice(0, 80) : []);

  const header = (
    <div className="fhead">
      <div className="fbc"><span className="bc-cur">{mode === "csv" ? "Import CSV File" : "Add Contract"}</span></div>
      <div className="fhead-r">
        <div className="stepwrap" ref={menuRef}>
          <button className="stepbtn" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{step} of 2: {STEP_NAMES[step - 1]}<ChevronDown size={14} /></button>
          {menu && (
            <div className="menu stepmenu" role="menu">
              {STEP_NAMES.map((n, i) => (
                <button key={n} role="menuitem" className={"step-i" + (step === i + 1 ? " on" : "")} disabled={i === 1 && !canContinue} onClick={() => { setStep(i + 1); setMenu(false); }}>
                  <span className="stepnum">{i + 1}</span><span><span className="b">{n}</span><span className="sub">{i === 0 ? (idle ? "In progress" : settled ? "Complete" : "Reading " + items.filter((x) => x.status !== "done" && x.status !== "error").length + " of " + items.length) : canPublish ? "Ready to publish" : "Pending"}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="vdiv" />
        <button className="cancel" onClick={onCancel}>Cancel</button>
        {!idle && step === 1 && <button className="btn primary" disabled={!canContinue} onClick={() => setStep(2)}>Continue</button>}
        {!idle && step === 2 && <button className="btn primary" disabled={!canPublish} title={canPublish ? "" : "Accept the suggested actions for every contract you are publishing"} onClick={() => onPublish(included.map((i) => i.result.contract))}>Publish {included.length} contract{included.length === 1 ? "" : "s"}</button>}
      </div>
    </div>
  );

  if (idle) return (
    <div className="flowwrap">
      {header}
      <div className="emptyfull" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
        <div className="emptyicon"><FileText size={28} /></div>
        <div className="h2">{mode === "csv" ? "Import a fee schedule CSV" : "Add contracts to the repository"}</div>
        <p className="muted emptycopy">{mode === "csv" ? "Claude maps the columns in your CSV to rate rows. You review everything next to the source before it is published." : "Drop one or several payer contract PDFs. You see the pages as you scan them, Claude pulls out each payer, the rates and the terms, and you review every contract next to its document before publishing them together."}</p>
        <div className="dropbox">
          <Upload size={22} />
          <div className="b">{mode === "csv" ? "Drop a CSV file here" : "Drop contract PDFs here"}</div>
          <div className="muted small">{mode === "csv" ? "CSV, up to 25 MB" : "Several files at once. PDF with a text layer, any length, up to 25 MB each"}</div>
          <input ref={fileRef} type="file" multiple accept={mode === "csv" ? ".csv" : ".pdf,.csv,.txt"} hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <div className="row gap"><button className="btn" onClick={() => fileRef.current.click()}>Choose files</button>
            {mode !== "csv" && <button className="btn primary" onClick={addSamples}>Use 3 sample contracts</button>}</div>
        </div>
        <div className="muted small">The sample contracts are fictional. Claims in this demo are tied to the Cascadia sample.</div>
      </div>
    </div>
  );

  return (
    <div className="flowwrap">
      {header}
      {step === 2 ? (
        <div className="flowbody"><div className="apcol wide">
          <div className="aibanner">
            <Sparkles size={16} />
            <div className="grow"><div className="b">{canPublish ? `${included.length} contract${included.length === 1 ? " is" : "s are"} ready to publish` : blocking.length ? `${blocking.length} contract${blocking.length === 1 ? " needs" : "s need"} a decision before you publish` : "Select the contracts you want to publish"}</div>
              <div className="muted small">Publishing adds each contract to the repository with its rates and terms. Select a row to go back and review that contract.</div></div>
          </div>
          <div className="tblwrap"><table className="tbl">
            <thead><tr><th style={{ width: 36 }}></th><th>Contract</th><th>Payer</th><th>File</th><th className="r">Pages</th><th className="r">Rates</th><th className="r">Terms</th><th>Status</th></tr></thead>
            <tbody>{items.map((it) => {
              const c = it.result ? it.result.contract : null; const pn = pendingOf(it);
              return (
                <tr key={it.id} className="clickrow" onClick={() => { setSel(it.id); setStep(1); }}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={"Include " + it.name} disabled={it.status !== "done"} checked={it.status === "done" && !excluded[it.id]} onChange={(e) => setExcluded({ ...excluded, [it.id]: !e.target.checked })} /></td>
                  <td className="b">{c ? c.number : "n/a"}</td><td>{c ? c.masterPayer : ""}</td><td><Cut w={230}>{it.name}</Cut></td>
                  <td className="r">{it.viewer && it.viewer.kind === "pdf" ? it.viewer.index.pages.length : "n/a"}</td><td className="r">{c ? c.rows.length : "n/a"}</td><td className="r">{c ? c.terms.length : "n/a"}</td>
                  <td>{it.status === "error" ? <Chip tone="rust">Could not be read</Chip> : pn > 0 ? <Chip tone="amber">{pn} to review</Chip> : <Chip tone="moss">Ready</Chip>}</td>
                </tr>
              );
            })}</tbody></table></div>
        </div></div>
      ) : (
        <div className="cbody">
          <div className="clist" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
            <div className="clist-h">Contracts <span className="cnt">{items.length}</span></div>
            {items.map((it) => (
              <div key={it.id} className={"citem" + (sel === it.id ? " on" : "")}>
                <button className="citem-b" title={it.name} onClick={() => setSel(it.id)}>{statusIcon(it)}<span className="ellip">{label(it)}</span></button>
                <button className="citem-x" aria-label={"Remove " + it.name} onClick={() => removeItem(it.id)}><X size={14} /></button>
              </div>
            ))}
            <input ref={moreRef} type="file" multiple accept=".pdf,.csv,.txt" hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <button className="btn clist-add" onClick={() => moreRef.current.click()}><Plus size={14} />Add contracts</button>
          </div>

          <div className="cmid">
            {cur && cur.status === "error" && (
              <div className="errbox card"><AlertTriangle size={18} className="warnc" /><div className="grow"><div className="b">This contract could not be read</div><div className="muted">{cur.name}: {cur.error}</div></div>
                <button className="btn" onClick={() => removeItem(cur.id)}>Remove</button></div>
            )}
            {cur && (cur.status === "queued" || cur.status === "reading") && (
              <>
                <div className="chead">{cur.name}</div>
                <div className="card stages">
                  <div className="h3">{cur.status === "queued" ? "Waiting to start" : "Claude is reading the contract"}</div>
                  {cur.steps.map((s, i) => (
                    <div key={i} className={"stage" + (i < cur.stage ? " done" : i === cur.stage ? " cur" : "")}>
                      {i < cur.stage ? <CheckCircle2 size={16} /> : i === cur.stage ? <Loader2 size={16} className="spin" /> : <span className="dot" />}{s}
                    </div>
                  ))}
                </div>
              </>
            )}
            {cur && cur.status === "done" && contract && (
              <>
                <div className="chead">{contract.number}</div>
                <div className="muted small csub">{cur.name}{viewer && viewer.kind === "pdf" ? ` , ${viewer.index.pages.length} pages` : ""}</div>
                <div className="aisum">
                  <div className="aisum-t">
                    <div className="b15">{pending ? `${pending} item${pending > 1 ? "s" : ""} need${pending > 1 ? "" : "s"} your review before you publish` : "Everything checks out. This contract is ready to publish"}</div>
                    <div>
                      {isGen
                        ? `Athelas AI found ${contract.rows.length} rates and ${contract.terms.length} terms, reading ${contract.meta.readRate.length} of ${contract.meta.rateCands.length} rate pages. `
                        : `Athelas AI found ${contract.plans.length} plans, ${contract.rows.length} rate rows and ${contract.terms.length} terms. ${cur.result.liveA && cur.result.liveB ? `Read live by Claude in ${(cur.result.ms / 1000).toFixed(1)}s.` : "Live read unavailable, showing the cached extraction."} `}
                      Select anything below to see where it comes from in the document.
                    </div>
                    <div className="row gap">
                      <button className={"icon" + (helpful === "up" ? " sel" : "")} aria-label="Helpful" onClick={() => setHelpful("up")}><ThumbsUp size={18} /></button>
                      <button className={"icon" + (helpful === "down" ? " sel" : "")} aria-label="Not helpful" onClick={() => setHelpful("down")}><ThumbsDown size={18} /></button>
                    </div>
                  </div>
                  <div className="aisum-b">
                    <div className="sublabel">QA Review</div>
                    <div className="qalist">
                      {qa.checks.map((c) => (
                        <div key={c.id} className={"qacard" + (focus && focus.qaId === c.id ? " on" : "")} role="button" tabIndex={0} onClick={() => c.anchor && point(c.anchor.needle, c.anchor.nth, { qaId: c.id, page: c.anchor.page, toEol: c.id === "f" || c.id === "d" })}>
                          {c.ok ? <CheckCircle2 size={16} className="okc" /> : <AlertTriangle size={16} className="warnc" />}
                          <div className="lt"><div className="b15">{c.label}</div><div>{c.detail}</div></div>
                          {c.action && <button className="btn" disabled={cur.more} onClick={(e) => { e.stopPropagation(); readMore(cur.id); }}>{cur.more ? "Reading" : c.action.label}</button>}
                        </div>
                      ))}
                    </div>
                    {qa.reviews.length > 0 && <div className="sublabel">Suggested Action</div>}
                    {qa.reviews.map((r) => {
                      const acc = !!cur.accepted[r.id];
                      return (
                        <div key={r.id} className={"actcard" + (acc ? " done" : "") + (focus && focus.qaId === r.id ? " on" : "")}>
                          <div className="actrow">
                            <button className="b15 plainb lt" onClick={() => r.anchor && point(r.anchor.needle, r.anchor.nth, { qaId: r.id, page: r.anchor.page })}>{r.label}</button>
                            {r.action && !acc && <button className="btn" disabled={cur.more} onClick={() => readMore(cur.id)}>{cur.more ? "Reading" : r.action.label}</button>}
                            {acc ? <span className="tagc ok"><Check size={12} />Accepted</span> : <button className="btn outline" onClick={() => patch(cur.id, (x) => ({ accepted: { ...x.accepted, [r.id]: true } }))}>Accept</button>}
                          </div>
                          <div className="b13">{r.detail}</div>
                        </div>
                      );
                    })}
                    {isGen && <div className="note"><Info size={14} /><span>Claims in this demo are synthetic and tied to the Cascadia sample, so rates from this contract appear in the repository but are not applied to those claims.</span></div>}
                  </div>
                </div>

                <Disclosure title="Rates" count={`${contract.rows.length} found`} open={open.rates} onToggle={() => setOpen({ ...open, rates: !open.rates })}>
                  <RatesTable rows={ratesShown} contractMap={cmap} ruleOn={ruleOnPreview} compact activeId={focus && focus.rowId} onRow={(r) => { const a = rowAnchor(r); point(a.needle, a.nth, { toEol: a.toEol, rowId: r.id, page: a.page }); }} />
                  {contract.rows.length > 80 && !showAll && <div className="morerow"><button className="btn" onClick={() => setShowAll(true)}>Show all {contract.rows.length} rows</button></div>}
                </Disclosure>
                <Disclosure title="Terms" count={`${contract.terms.length} found`} open={open.terms} onToggle={() => setOpen({ ...open, terms: !open.terms })}>
                  <div className="terms">
                    {contract.terms.map((t) => (
                      <button key={t.id} className={"termrow clickable" + (focus && focus.termId === t.id ? " on" : "")} onClick={() => point(t.source, 0, { termId: t.id, page: t.page })}>
                        <Chip tone="grey">{t.category}</Chip>{t.section && <span className="b">Section {t.section}</span>}<span className="lt">{t.summary}</span>{t.page && isGen ? <span className="muted nowrap">p. {t.page}</span> : null}
                      </button>
                    ))}
                    {!contract.terms.length && <div className="muted pad">No terms were found on the pages that were read.</div>}
                  </div>
                </Disclosure>
              </>
            )}
          </div>

          <div className="cdoc">
            {viewer && viewer.kind === "pdf" && <PdfReader key={cur.id} item={cur} rectsByPage={rectsByPage} focusPage={pdfHit ? pdfHit.page : null} nonce={focus ? focus.nonce : 0} />}
            {viewer && viewer.kind === "text" && <DocPane text={text} marks={marks} activeIdx={textMark ? 1000 : -1} shownIdx={baseMarks.map((m) => m.idx)} nonce={focus ? focus.nonce : 0} title="" pdfName={cur.name} zoom={100} />}
            {!viewer && <div className="docscroll"><div className="paper pdfcard">{cur && cur.status === "error" ? <FileText size={28} /> : <Loader2 size={22} className="spin" />}<div className="muted">{cur && cur.status === "error" ? "No preview available" : "Opening the document"}</div></div></div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Contracts page
   ============================================================ */
function AddContractButton({ onAdd, onImport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  return (
    <div className="sbtn-wrap" ref={ref}>
      <div className="sbtn">
        <button className="sbtn-main" onClick={onAdd}><Plus size={16} />Add Contract</button>
        <button className="sbtn-caret" aria-haspopup="menu" aria-expanded={open} aria-label="More ways to add contracts" onClick={() => setOpen(!open)}><ChevronDown size={16} /></button>
      </div>
      {open && <div className="menu" role="menu"><button role="menuitem" className="menu-i" onClick={() => { setOpen(false); onImport(); }}><Upload size={16} />Import CSV File</button></div>}
    </div>
  );
}

const COLS = [["payer", "Payer"], ["group", "Payer group"], ["ptype", "Plan type"], ["plan", "Plan"], ["svc", "Service"], ["cpt", "CPT"], ["method", "Method"], ["fs", "Fee schedule"], ["rate", "Rate"], ["exp", "Expected allowed"], ["fac", "Facility"], ["state", "State"], ["units", "Units"], ["appt", "Appt type"], ["year", "Rate year"], ["start", "Start"], ["end", "End"]];
const RIGHT = { fs: 1, rate: 1, exp: 1 };
const toneOf = (g) => (g === "Commercial" ? "teal" : g === "Medicare" ? "navy" : g === "Medicaid" ? "plum" : "grey");
const Cut = ({ children, w = 240 }) => <span className="cut" style={{ maxWidth: w }} title={typeof children === "string" ? children : undefined}>{children}</span>;
function formulaOf(r, c, calc) {
  if (calc.amount == null) return "";
  const parts = [];
  calc.steps.forEach((s) => {
    if (s.k === "fs") parts.push(fmt(s.value));
    else if (s.k === "disc") parts.push(r.discount + "%");
    else if (s.k === "flat" || s.k === "unit") parts.push(fmt(s.value));
    else if (s.k === "esc" && s.active) parts.push((1 + c.escalatorPct / 100).toFixed(3));
    else if (s.k === "pta" && s.active) parts.push(c.ptaPct + "%");
  });
  return parts.length < 2 ? "" : parts.join(" \u00d7 ") + " = " + fmt(calc.amount);
}
/* Hover card on the Expected allowed amount: shows how the number was built (Allison's comment on the PM doc) */
function CalcHover({ r, c, on }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const calc = calcUnit(r, c, TODAY, on, false);
  const show = () => {
    const el = ref.current; if (!el) return;
    const b = el.getBoundingClientRect(); const W = 330;
    const below = window.innerHeight - b.bottom > 330;
    setPos({ left: Math.max(8, Math.min(window.innerWidth - W - 8, b.right - W)), top: below ? b.bottom + 6 : "auto", bottom: below ? "auto" : window.innerHeight - b.top + 6 });
  };
  const note = r.method === "per_visit" ? "Paid once per visit, whatever the number of units." : calc.amount == null ? "" : ["case_rate", "per_diem", "per_code", "other"].includes(r.method) ? "Paid as written in the contract." : "Per claim line: this amount \u00d7 the units billed.";
  return (
    <span className="hovr" ref={ref} tabIndex={0} onMouseEnter={show} onMouseLeave={() => setPos(null)} onFocus={show} onBlur={() => setPos(null)}>
      {calc.amount == null ? <span className="muted">n/a</span> : <span className="b">{fmt(calc.amount)}<span className="sub">{unitSuffix(r)}</span></span>}
      {pos && (
        <span className="calc-pop" role="tooltip" style={{ left: pos.left, top: pos.top, bottom: pos.bottom }} onClick={(e) => e.stopPropagation()}>
          <span className="cp-h">How this was calculated</span>
          {formulaOf(r, c, calc) && <span className="cp-f">{formulaOf(r, c, calc)}</span>}
          {calc.steps.map((s, i) => (
            <span key={i} className={"cp-row" + (s.rule && !s.active ? " off" : "")}>
              <span className="cp-l"><span className="b">{s.label}</span><span className="muted">{s.note}</span></span>
              {s.rule && <Chip tone={s.active ? "moss" : "grey"}>{s.active ? "Rule on" : "Rule off"}</Chip>}
              <span className="cp-v">{fmt(s.value)}</span>
            </span>
          ))}
          <span className="cp-t"><span>Expected allowed</span><span>{fmt(calc.amount)}</span></span>
          {note && <span className="cp-n">{note}</span>}
          <span className="cp-n">Select the row to try other service dates or a PTA.</span>
        </span>
      )}
    </span>
  );
}
const CELLS = {
  payer: (r) => r.payer,
  group: (r) => <Chip tone={toneOf(r.payerGroup)}>{r.payerGroup}</Chip>,
  ptype: (r) => <Cut w={200}>{r.planType}</Cut>, plan: (r) => <span className="b"><Cut w={200}>{r.plan}</Cut></span>, svc: (r) => <Cut w={260}>{r.svc || ""}</Cut>,
  cpt: (r) => <Cut w={170}>{r.cpt}</Cut>, method: (r) => METHOD[r.method] || r.method,
  fs: (r) => (r.base != null ? fmt(r.base) : r.basis ? <Cut w={190}>{r.basis}</Cut> : "n/a"),
  rate: (r) => (r.flat != null ? fmt(r.flat) : r.discount != null ? r.discount + "%" : "n/a"),
  exp: (r, c, on) => <CalcHover r={r} c={c} on={on} />,
  fac: (r) => r.facility, state: (r) => r.state, units: (r) => r.units, appt: (r) => r.apptType,
  year: (r) => (r.year ? "Year " + r.year : "n/a"),
  start: (r) => <span className="nowrap">{fmtDate(r.start) || "n/a"}</span>, end: (r) => <span className="nowrap">{fmtDate(r.end) || "n/a"}</span>,
};
function usePop(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const k = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  return ref;
}

/* ============================================================
   Fee schedules: loading a schedule by itself, with its own QA
   ============================================================ */
const normName = (s) => String(s || "").toLowerCase().replace(/\.(csv|txt|tsv)$/i, "").replace(/[_-]+/g, " ").replace(/\b(19|20)\d\d\b/g, " ").replace(/\b(the|fee|schedules?|csv)\b/g, " ").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const sameSched = (a, b) => { const x = normName(a), y = normName(b); return !!x && !!y && (x.includes(y) || y.includes(x)); };
const nameFromFile = (n) => String(n || "").replace(/\.(csv|txt|tsv)$/i, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
const yearDate = (s) => { const m = String(s || "").match(/\b((?:19|20)\d\d)\b/); return m ? m[1] + "-01-01" : ""; };
function parseCsv(text) {
  const src = String(text || "").replace(/^\uFEFF/, "");
  const first = src.split(/\r?\n/)[0] || "";
  const delim = [",", "\t", ";", "|"].map((d) => [d, first.split(d).length - 1]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && src[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim()));
}
const normHdr = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
function parseFeeCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return { error: "The file has no data rows." };
  const hdr = rows[0];
  const find = (re, skip = []) => hdr.findIndex((h, i) => !skip.includes(i) && re.test(normHdr(h)));
  const cpt = find(/^(cpt|hcpcs|procedure|proc|code)\b|cpt code|procedure code|service code/);
  const amt = find(/allowed|amount|rate|fee|price|payment|reimb/, [cpt]);
  const desc = find(/desc|service name|^service$|^name$/, [cpt, amt]);
  const date = find(/effective|eff date|start/, [cpt, amt, desc]);
  if (cpt < 0 || amt < 0) return { error: `Could not find ${cpt < 0 ? "a CPT code column" : "an amount column"}. The columns in this file are: ${hdr.join(", ")}.` };
  const items = rows.slice(1).map((r, i) => {
    const raw = String(r[amt] == null ? "" : r[amt]).trim();
    const amount = raw === "" ? NaN : Number(raw.replace(/[$,\s]/g, ""));
    return { n: i + 2, cpt: String(r[cpt] || "").trim().toUpperCase(), desc: desc >= 0 ? String(r[desc] || "").trim() : "", raw, amount, date: date >= 0 ? String(r[date] || "").trim() : "" };
  });
  return { header: hdr, map: { cpt, amt, desc, date }, items, dateGuess: (items.find((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date)) || {}).date || "" };
}
function findPrevSchedule(name, eff, existing) {
  const same = (existing || []).filter((s) => s.name !== name && sameSched(s.name, name) && (!eff || !s.effective || s.effective < eff));
  return same.sort((a, b) => (b.effective || "").localeCompare(a.effective || ""))[0] || null;
}
/* QA for a fee schedule load. Every finding is either a check or a suggested action with an optional fix. */
function qaFee(parsed, name, eff, existing) {
  const items = parsed.items, checks = [], actions = [], flags = {};
  const flag = (i, tag) => { (flags[i] = flags[i] || []).push(tag); };
  const prev = findPrevSchedule(name, eff, existing);
  const validCode = (c) => /^([0-9]{5}|[A-Z][0-9]{4})$/.test(c);
  const hdr = parsed.header, m = parsed.map;
  checks.push({ id: "cols", label: "Column mapping", detail: `CPT is "${hdr[m.cpt]}", amount is "${hdr[m.amt]}"${m.desc >= 0 ? `, description is "${hdr[m.desc]}"` : ""}${m.date >= 0 ? `, effective date is "${hdr[m.date]}"` : ""}`, ok: true, rows: [] });
  const bad = items.map((x, i) => (!validCode(x.cpt) || !(x.amount > 0) ? i : -1)).filter((i) => i >= 0);
  bad.forEach((i) => flag(i, !validCode(items[i].cpt) ? "Invalid code" : "Unreadable amount"));
  if (bad.length) actions.push({ id: "bad", label: `${bad.length} row${bad.length > 1 ? "s" : ""} could not be read`, detail: `Rows ${bad.map((i) => items[i].n).join(", ")} have a code that is not a CPT or HCPCS code, or an amount that is not a positive number. Leave them out of the schedule.`, rows: bad, drop: bad, label2: "Exclude" });
  else checks.push({ id: "valid", label: "Codes and amounts", detail: `All ${items.length} rows have a valid code and a positive amount`, ok: true, rows: [] });
  const good = items.map((x, i) => i).filter((i) => !bad.includes(i));
  // duplicates
  const byCode = {}; good.forEach((i) => { (byCode[items[i].cpt] = byCode[items[i].cpt] || []).push(i); });
  const dups = Object.entries(byCode).filter(([, ix]) => ix.length > 1);
  dups.forEach(([code, ix]) => {
    ix.forEach((i) => flag(i, "Duplicate"));
    const amts = [...new Set(ix.map((i) => items[i].amount))];
    const pv = prev && prev.amounts[code] != null ? prev.amounts[code] : null;
    const keep = amts.length === 1 ? ix[0] : ix.slice().sort((a, b) => (pv != null ? Math.abs(items[a].amount - pv) - Math.abs(items[b].amount - pv) : items[a].amount - items[b].amount))[0];
    const drop = ix.filter((i) => i !== keep);
    actions.push({ id: "dup-" + code, label: amts.length === 1 ? `CPT ${code} appears ${ix.length} times with the same amount` : `CPT ${code} appears ${ix.length} times with different amounts`, detail: amts.length === 1 ? `Keep one row and remove the repeats.` : `${amts.map((a) => fmt(a)).join(" and ")}. Keep ${fmt(items[keep].amount)}${pv != null ? `, which is closest to the earlier ${fmt(pv)}` : ", the lower amount"}, and exclude the other.`, rows: ix, drop });
  });
  if (!dups.length) checks.push({ id: "dups", label: "Duplicates", detail: "Every CPT code appears once", ok: true, rows: [] });
  // charge master coverage
  const unknown = good.filter((i) => CHARGE[items[i].cpt] == null);
  unknown.forEach((i) => flag(i, "Not on charge master"));
  if (unknown.length) actions.push({ id: "unk", label: `${unknown.length === 1 ? "CPT " + items[unknown[0]].cpt + " is" : unknown.length + " codes are"} not on the charge master`, detail: `${[...new Set(unknown.map((i) => items[i].cpt))].join(", ")} cannot be billed from this practice's charge master, so no claim would use ${unknown.length === 1 ? "it" : "them"}. Exclude ${unknown.length === 1 ? "it" : "them"}.`, rows: unknown, drop: unknown });
  const have = new Set(good.map((i) => items[i].cpt));
  const missing = Object.keys(CHARGE).filter((c) => !have.has(c));
  if (missing.length) actions.push({ id: "miss", label: `${missing.length} charge master code${missing.length > 1 ? "s are" : " is"} missing`, detail: `${missing.join(", ")} ${missing.length > 1 ? "have" : "has"} no amount in this file. Publish anyway and expected allowed stays n/a for ${missing.length > 1 ? "them" : "it"} until ${missing.length > 1 ? "they are" : "it is"} added.`, rows: [] });
  else checks.push({ id: "cov", label: "Charge master coverage", detail: `All ${Object.keys(CHARGE).length} charge master codes have an amount`, ok: true, rows: [] });
  const out = new Set([...unknown, ...actions.filter((a) => a.id.startsWith("dup-")).flatMap((a) => a.drop || [])]);
  const live = good.filter((i) => !out.has(i));
  // amounts above billed charges
  const over = live.filter((i) => CHARGE[items[i].cpt] != null && items[i].amount > CHARGE[items[i].cpt]);
  over.forEach((i) => flag(i, "Above charge"));
  if (over.length) actions.push({ id: "over", label: `${over.length} amount${over.length > 1 ? "s are" : " is"} above the billed charge`, detail: `${over.map((i) => `${items[i].cpt} is ${fmt(items[i].amount)} against a charge of ${fmt(CHARGE[items[i].cpt])}`).join("; ")}. A payer would not pay more than the charge. Confirm ${over.length > 1 ? "they are" : "it is"} correct.`, rows: over });
  // change against the earlier version
  if (prev) {
    const moves = live.filter((i) => prev.amounts[items[i].cpt] != null).map((i) => ({ i, pv: prev.amounts[items[i].cpt], ch: (items[i].amount - prev.amounts[items[i].cpt]) / prev.amounts[items[i].cpt] }));
    moves.forEach((x) => { items[x.i].prev = x.pv; items[x.i].change = x.ch; });
    const odd = moves.filter((x) => Math.abs(x.ch) > 0.15);
    const rest = moves.filter((x) => Math.abs(x.ch) <= 0.15);
    const avg = rest.length ? rest.reduce((s, x) => s + x.ch, 0) / rest.length : 0;
    odd.forEach((x) => flag(x.i, (x.ch > 0 ? "+" : "") + Math.round(x.ch * 100) + "%"));
    odd.forEach((x) => actions.push({ id: "chg-" + items[x.i].cpt, label: `CPT ${items[x.i].cpt} ${x.ch > 0 ? "rose" : "fell"} ${Math.abs(Math.round(x.ch * 100))}%`, detail: `${fmt(x.pv)} in ${prev.name} and ${fmt(items[x.i].amount)} here. ${rest.length ? `The other ${rest.length} code${rest.length > 1 ? "s" : ""} moved ${(avg * 100).toFixed(1)}% on average. ` : ""}Confirm the new amount before it is used to calculate expected allowed.`, rows: [x.i] }));
    checks.push({ id: "chg", label: "Change from the earlier version", detail: `${moves.length} codes compared with ${prev.name}. ${odd.length ? `${rest.length} moved ${(avg * 100).toFixed(1)}% on average and ${odd.length} moved more than 15%` : `Average change ${(avg * 100).toFixed(1)}%`}`, ok: true, rows: [] });
  } else checks.push({ id: "chg", label: "Earlier version", detail: "No earlier version of this schedule is on file, so there is nothing to compare against", ok: true, rows: [] });
  return { checks, actions, flags, prev, codes: have.size };
}
function unresolvedBases(contracts, schedules) {
  const out = {};
  contracts.forEach((c) => c.rows.forEach((r) => {
    if (r.method !== "percent_of_fee_schedule" || r.base != null || !r.basis) return;
    if ((schedules || []).some((s) => sameSched(s.name, r.basis))) return;
    const nice = String(r.basis).replace(/^the\s+/i, "").replace(/^./, (ch) => ch.toUpperCase());
    const o = out[nice] || (out[nice] = { basis: nice, numbers: [], rows: 0 });
    if (!o.numbers.includes(c.number)) o.numbers.push(c.number); o.rows++;
  }));
  return Object.values(out);
}
/* a loaded schedule fills in rates that pointed at it: one row per CPT code when the contract gave no code */
function resolveContracts(contracts, schedules) {
  if (!schedules || !schedules.length) return contracts;
  return contracts.map((c) => {
    let changed = false;
    const rows = c.rows.flatMap((r) => {
      if (r.method !== "percent_of_fee_schedule" || r.base != null || !r.basis) return [r];
      const s = schedules.find((x) => sameSched(x.name, r.basis));
      if (!s) return [r];
      changed = true;
      if (/^\d{5}$/.test(r.cpt)) return s.amounts[r.cpt] != null ? [{ ...r, base: s.amounts[r.cpt], basisResolved: s.name }] : [r];
      return Object.keys(s.amounts).map((cpt) => ({ ...r, id: r.id + "-" + cpt, cpt, svc: CPT[cpt] || cpt, base: s.amounts[cpt], basisResolved: s.name }));
    });
    return changed ? { ...c, rows } : c;
  });
}
const FEE_TEMPLATE = "CPT Code,Description,Allowed Amount,Effective Date\n97110,Therapeutic exercise,0.00,2026-01-01\n97140,Manual therapy,0.00,2026-01-01\n";
const NW_FEE_CSV = "CPT Code,Description,Allowed Amount,Effective Date\n97110,Therapeutic exercise,45.20,2025-07-01\n97140,Manual therapy,42.60,2025-07-01\n97530,Therapeutic activities,49.10,2025-07-01\n97112,Neuromuscular re-education,47.30,2025-07-01\n97161,PT evaluation low complexity,139.00,2025-07-01\n";
const CASC_FEE_CSV = "CPT Code,Description,Allowed Amount,Effective Date\n97110,Therapeutic exercise,43.05,2026-01-01\n97140,Manual therapy,54.60,2026-01-01\n97112,Neuromuscular re-education,47.15,2026-01-01\n97161,PT evaluation low complexity,141.45,2026-01-01\n97110,Therapeutic exercise,430.50,2026-01-01\n97999,Unlisted physical medicine service,60.00,2026-01-01\n";
const FEE_SAMPLES = [
  { key: "nw", name: "Northwind_Standard_Fee_Schedule_2025.csv", text: NW_FEE_CSV, label: "Northwind Standard Fee Schedule", note: "clean file" },
  { key: "casc", name: "Cascadia_Mutual_Health_Outpatient_Therapy_Fee_Schedule_2026.csv", text: CASC_FEE_CSV, label: "Cascadia 2026 update", note: "has problems" },
];

function FeeScheduleFlow({ hint, existing, contracts, schedules, onCancel, onPublish, setAiHook }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [eff, setEff] = useState("");
  const [accepted, setAccepted] = useState({});
  const [focus, setFocus] = useState(null);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(true);
  const fileRef = useRef(null), menuRef = useRef(null), rowEls = useRef({});
  useEffect(() => {
    if (!menu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    const k = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [menu]);

  const load = (f) => {
    const parsed = parseFeeCsv(f.text);
    setFile({ name: f.name, parsed });
    setName(hint && parsed.items && !sameSched(nameFromFile(f.name), hint) ? hint : nameFromFile(f.name));
    setEff(parsed.dateGuess || yearDate(f.name));
    setAccepted({}); setFocus(null);
  };
  const onFile = (f) => { if (!f) return; const rd = new FileReader(); rd.onload = () => load({ name: f.name, text: String(rd.result) }); rd.readAsText(f); };
  const parsed = file ? file.parsed : null;
  const ok = !!parsed && !parsed.error;
  const qa = useMemo(() => (ok ? qaFee(parsed, name, eff, existing) : null), [file, name, eff, existing]);
  const dropped = new Set(qa ? qa.actions.filter((a) => accepted[a.id] && a.drop).flatMap((a) => a.drop) : []);
  const pending = qa ? qa.actions.filter((a) => !accepted[a.id]).length : 0;
  const finalItems = ok ? parsed.items.filter((x, i) => !dropped.has(i) && /^([0-9]{5}|[A-Z][0-9]{4})$/.test(x.cpt) && x.amount > 0) : [];
  const amounts = {}; finalItems.forEach((x) => { amounts[x.cpt] = x.amount; });
  const impact = ok ? contracts.flatMap((c) => c.rows.filter((r) => r.method === "percent_of_fee_schedule" && r.base == null && r.basis && sameSched(r.basis, name)).map(() => c.number)) : [];
  const impactNums = [...new Set(impact)];
  const canPublish = ok && pending === 0 && !!name.trim() && finalItems.length > 0;
  const focusRows = focus ? new Set(focus.rows) : new Set();
  useEffect(() => { if (focus && focus.rows.length && rowEls.current[focus.rows[0]] && rowEls.current[focus.rows[0]].scrollIntoView) rowEls.current[focus.rows[0]].scrollIntoView({ block: "center", behavior: "smooth" }); }, [focus]);

  useEffect(() => {
    if (!ok) { setAiHook({ context: "The user is loading a fee schedule on its own, as a CSV with CPT codes and allowed amounts. The loader checks the columns, code format, duplicates, coverage against the practice charge master, amounts above billed charges, and change from the earlier version of the same schedule. Each finding is a suggested action the user accepts before publishing. A published schedule fills in expected allowed for contract rates that point at it by name." + (hint ? ` Contracts currently refer to a schedule called ${hint} that is not loaded.` : ""), prompts: [{ q: "What columns does the file need?" }, { q: "What does the QA check?" }] }); return; }
    setAiHook({ context: `Fee schedule being loaded: ${name}, effective ${eff || "unknown"}, ${parsed.items.length} rows read. Findings: ${qa.actions.map((a) => a.label + ". " + a.detail + (accepted[a.id] ? " (accepted)" : " (open)")).join(" | ") || "none"}. Checks passed: ${qa.checks.map((c) => c.label + ": " + c.detail).join(" | ")}. Earlier version: ${qa.prev ? qa.prev.name : "none"}. Contracts that would be filled in by publishing: ${impactNums.join(", ") || "none"}.`, prompts: [{ q: "Which items need my review?" }, { q: "Why were these rows flagged?" }, { q: "What changes when I publish?" }] });
  }, [file, name, eff, pending]);

  const header = (
    <div className="fhead">
      <div className="fbc"><span className="bc-cur">Add Fee Schedule</span></div>
      <div className="fhead-r">
        <div className="stepwrap" ref={menuRef}>
          <button className="stepbtn" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{file ? 2 : 1} of 2: {file ? "Review and publish" : "Upload"}<ChevronDown size={14} /></button>
          {menu && (
            <div className="menu stepmenu" role="menu">
              {["Upload", "Review and publish"].map((n, i) => (
                <button key={n} role="menuitem" className={"step-i" + ((file ? 1 : 0) === i ? " on" : "")} disabled={i === 1 && !file} onClick={() => { if (i === 0) { setFile(null); } setMenu(false); }}>
                  <span className="stepnum">{i + 1}</span><span><span className="b">{n}</span><span className="sub">{i === 0 ? (file ? "Complete" : "In progress") : file ? (canPublish ? "Ready to publish" : pending + " to review") : "Pending"}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="vdiv" />
        <button className="cancel" onClick={onCancel}>Cancel</button>
        {file && <button className="btn primary" disabled={!canPublish} title={canPublish ? "" : "Accept the suggested actions first"} onClick={() => onPublish({ id: "fs-" + slug(name) + "-" + Date.now(), name: name.trim(), effective: eff, amounts, file: file.name, rows: finalItems.length, loadedOn: TODAY, prev: qa.prev ? qa.prev.name : null })}>Publish fee schedule</button>}
      </div>
    </div>
  );

  if (!file) return (
    <div className="flowwrap">
      {header}
      <div className="emptyfull" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
        <div className="emptyicon"><FileText size={28} /></div>
        <div className="h2">Add a fee schedule</div>
        <p className="muted emptycopy">Upload a CSV with a CPT code column and an allowed amount column. We check it against your charge master and the earlier version before you publish.</p>
        {hint && <div className="banner amber nogap" style={{ maxWidth: 560 }}><Info size={16} /><span>Contracts refer to <b>{hint}</b>, which is not loaded yet. Name your file after it and expected allowed fills in.</span></div>}
        <div className="dropbox">
          <Upload size={22} />
          <div className="b">Drop a fee schedule CSV here</div>
          <div className="muted small">CSV, tab or semicolon separated. Columns are matched by name.</div>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" hidden onChange={(e) => { onFile(e.target.files[0]); e.target.value = ""; }} />
          <div className="row gap wrap"><button className="btn" onClick={() => fileRef.current.click()}>Choose a file</button>
            {FEE_SAMPLES.map((s) => <button key={s.key} className={"btn" + (s.key === "nw" ? " primary" : "")} onClick={() => load(s)}>Use sample: {s.label} ({s.note})</button>)}</div>
        </div>
        <button className="link" onClick={() => { const blob = new Blob([FEE_TEMPLATE], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "fee_schedule_template.csv"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); }}>Download a CSV template</button>
      </div>
    </div>
  );

  if (parsed.error) return (
    <div className="flowwrap">{header}
      <div className="emptyfull"><div className="emptyicon bad"><AlertTriangle size={28} /></div><div className="h2">This file could not be read</div><p className="muted emptycopy">{file.name}: {parsed.error}</p><button className="btn" onClick={() => setFile(null)}>Try another file</button></div>
    </div>
  );

  return (
    <div className="flowwrap">
      {header}
      <div className="cbody">
        <div className="cmid wide2">
          <div className="chead">{name || "Fee schedule"}</div>
          <div className="muted small csub">{file.name}, {parsed.items.length} rows</div>
          <div className="card">
            <div className="fgrid"><Fld label="Fee schedule name" value={name} onChange={setName} wide /><Fld label="Effective date" value={eff} onChange={setEff} /><Fld label="CPT codes in this load" value={String(qa.codes)} readOnly /></div>
          </div>
          <div className="aisum">
            <div className="aisum-t">
              <div className="b15">{pending ? `${pending} item${pending > 1 ? "s" : ""} need${pending > 1 ? "" : "s"} your review before you publish` : "Everything checks out. This fee schedule is ready to publish"}</div>
              <div>Read {parsed.items.length} rows covering {qa.codes} CPT codes. {qa.prev ? `Compared with ${qa.prev.name}.` : "No earlier version of this schedule is on file."} Select anything below to see the rows it refers to.</div>
            </div>
            <div className="aisum-b">
              <div className="sublabel">QA Review</div>
              <div className="qalist">
                {qa.checks.map((c) => (
                  <div key={c.id} className="qacard"><CheckCircle2 size={16} className="okc" /><div className="lt"><div className="b15">{c.label}</div><div>{c.detail}</div></div></div>
                ))}
              </div>
              {qa.actions.length > 0 && <div className="sublabel">Suggested Action</div>}
              {qa.actions.map((a) => {
                const acc = !!accepted[a.id];
                return (
                  <div key={a.id} className={"actcard" + (acc ? " done" : "") + (focus && focus.id === a.id ? " on" : "")}>
                    <div className="actrow">
                      <button className="b15 plainb lt" onClick={() => setFocus({ id: a.id, rows: a.rows, nonce: Date.now() })}>{a.label}</button>
                      {acc ? <span className="tagc ok"><Check size={12} />Accepted</span> : <button className="btn outline" onClick={() => setAccepted({ ...accepted, [a.id]: true })}>{a.drop ? "Accept and exclude" : "Accept"}</button>}
                    </div>
                    <div className="b13">{a.detail}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <Disclosure title="What publishing changes" count={impactNums.length ? impactNums.length + " contract" + (impactNums.length > 1 ? "s" : "") : "No contracts yet"} open={open} onToggle={() => setOpen(!open)}>
            <div className="b13 pad0">{impactNums.length ? `${impactNums.join(", ")} ${impactNums.length > 1 ? "have" : "has"} rates that point at ${name}. Publishing fills in one expected allowed amount per CPT code for them.` : "No contract rate points at this schedule by name, so nothing changes in expected allowed today. The schedule is stored and will be used when a contract refers to it."}</div>
          </Disclosure>
        </div>
        <div className="cdoc fee-prev">
          <div className="fp-h"><span className="b">Rows in the file</span><span className="muted">{finalItems.length} will be published</span></div>
          <div className="fp-b">
            <table className="tbl compact">
              <thead><tr><th>Row</th><th>CPT</th><th>Description</th><th className="r">Amount</th><th className="r">Charge master</th><th className="r">Earlier</th><th className="r">Change</th><th>Status</th></tr></thead>
              <tbody>
                {parsed.items.map((x, i) => {
                  const fl = (qa.flags[i] || []); const gone = dropped.has(i);
                  return (
                    <tr key={i} ref={(el) => { rowEls.current[i] = el; }} className={(gone ? "rm " : "") + (focusRows.has(i) ? "active" : "")}>
                      <td>{x.n}</td><td className="b">{x.cpt || "n/a"}</td><td><Cut w={180}>{x.desc || (CPT[x.cpt] || "")}</Cut></td>
                      <td className="r">{isNaN(x.amount) ? x.raw || "n/a" : fmt(x.amount)}</td><td className="r">{CHARGE[x.cpt] != null ? fmt(CHARGE[x.cpt]) : "n/a"}</td>
                      <td className="r">{x.prev != null ? fmt(x.prev) : ""}</td><td className="r">{x.change != null ? (x.change > 0 ? "+" : "") + (x.change * 100).toFixed(1) + "%" : ""}</td>
                      <td>{gone ? <Chip tone="grey">Excluded</Chip> : fl.length ? fl.map((f) => <Chip key={f} tone="amber">{f}</Chip>) : <Chip tone="moss">OK</Chip>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Table Header (Design System 3.0): heading, one view tab, then filter, configuration, action and an inline Filled search */
function TableHeaderBar({ title, viewLabel, extra, filterOn, onFilter, config, action, q, setQ }) {
  return (
    <div className="th">
      <div className="th-title">
        <div className="th-h">{title}</div>
        <div className="th-views"><div className="tabs"><button className="on">{viewLabel}</button></div>{extra}</div>
      </div>
      <div className="hact">
        <button className={"tgl" + (filterOn ? " on" : "")} aria-label="Filters" aria-pressed={filterOn} onClick={onFilter}><ListFilter size={16} /></button>
        {config}
        {action}
        <label className="sf"><input placeholder="Search" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /><Search size={16} /></label>
      </div>
    </div>
  );
}
function FilterRow({ opts, filters, setFilters, onHide }) {
  const [open, setOpen] = useState(false);
  const ref = usePop(open, () => setOpen(false));
  const labelOf = (k, v) => { const o = opts.find((x) => x[0] === k); const f = o && o[2].find((p) => p[0] === v); return f ? f[1] : v; };
  const add = (k, v) => { if (!filters.some((f) => f.k === k && f.v === v)) setFilters([...filters, { k, v }]); setOpen(false); };
  return (
    <div className="frow">
      <div className="popwrap" ref={ref}>
        <button className="btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Plus size={14} />Filter</button>
        {open && (
          <div className="menu fmenu" role="menu">
            {opts.map(([k, l, vals]) => (
              <div key={k}><div className="menu-h">{l}</div>
                {vals.map(([v, vl]) => <button key={v} role="menuitem" className="menu-i" onClick={() => add(k, v)}>{vl}</button>)}</div>
            ))}
          </div>
        )}
      </div>
      <div className="grow row gap wrap">{filters.map((f) => <span key={f.k + f.v} className="fchip">{labelOf(f.k, f.v)}<button aria-label={"Remove filter " + labelOf(f.k, f.v)} onClick={() => setFilters(filters.filter((x) => x !== f))}><X size={12} /></button></span>)}</div>
      <button className="btn tert" onClick={onHide}><ChevronUp size={14} />Hide</button>
    </div>
  );
}
function ColumnsConfig({ defs, cols, setCols }) {
  const [open, setOpen] = useState(false);
  const ref = usePop(open, () => setOpen(false));
  const shown = defs.filter(([k]) => cols[k]).length;
  return (
    <div className="popwrap" ref={ref}>
      <button className={"tgl" + (open ? " on" : "")} aria-label="Table configuration" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}><Settings size={16} /></button>
      {open && (
        <div className="pop settings" role="dialog" aria-label="Table configuration">
          <div className="cfg-h"><span className="b">Columns</span><span className="muted">{shown} of {defs.length} shown</span></div>
          <div className="cfg-b">{defs.map(([k, l]) => <label key={k} className="crowc"><input type="checkbox" checked={cols[k]} disabled={cols[k] && shown === 1} onChange={(e) => setCols({ ...cols, [k]: e.target.checked })} />{l}</label>)}</div>
        </div>
      )}
    </div>
  );
}
const PLAIN = {
  payer: (r) => r.payer, group: (r) => r.payerGroup, ptype: (r) => r.planType, plan: (r) => r.plan, svc: (r) => r.svc || "", cpt: (r) => r.cpt, method: (r) => METHOD[r.method] || r.method,
  fs: (r) => (r.base != null ? fmt(r.base) : r.basis || "n/a"), rate: (r) => (r.flat != null ? fmt(r.flat) : r.discount != null ? r.discount + "%" : "n/a"),
  exp: (r, c, on) => { const a = calcUnit(r, c, TODAY, on, false).amount; return a == null ? "n/a" : fmt(a) + " " + unitSuffix(r); },
  fac: (r) => r.facility, state: (r) => r.state, units: (r) => r.units, appt: (r) => r.apptType, year: (r) => (r.year ? "Year " + r.year : "n/a"), start: (r) => fmtDate(r.start) || "n/a", end: (r) => fmtDate(r.end) || "n/a",
};
function downloadCsv(name, header, lines) {
  const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const blob = new Blob([[header, ...lines].map((l) => l.map(esc).join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function ContractsPage({ contracts, ruleOn, setRuleOn, createdTerms, setCreatedTerms, onUpload, drawerRow, setDrawerRow, openDoc, toast, claims, ruleLog, setRuleLog }) {
  const [q, setQ] = useState("");
  const [pop, setPop] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState("contract");
  const [cols, setCols] = useState(() => Object.fromEntries(COLS.map(([k]) => [k, true])));
  const [collapsed, setCollapsed] = useState({});
  const [selected, setSelected] = useState({});
  const [draft, setDraft] = useState(null);
  const [showHist, setShowHist] = useState(false);
  const [pv, setPv] = useState("root");
  const [termsFor, setTermsFor] = useState(null);
  const close = () => setPop(null);
  const sRef = usePop(pop === "settings", close);

  const cmap = Object.fromEntries(contracts.map((c) => [c.id, c]));
  const sorted = [...contracts].sort((a, b) => a.masterPayer.localeCompare(b.masterPayer));

  /* settings: every contract rule lives behind the table's gear */
  const tf = (cat) => contracts.flatMap((c) => c.terms.filter((t) => t.category === cat && !t.ruleKey));
  const DEFS = [
    { k: "escalator", label: "Apply annual escalators to expected allowed", sub: "Raises contracted rates on the dates written in each contract", has: contracts.some((c) => c.escalatorPct), get: contracts.some((c) => c.escalatorPct) && contracts.filter((c) => c.escalatorPct).every((c) => !!ruleOn[c.id + ":escalator"]) },
    { k: "pta", label: "Pay PTA (CQ) services at the contract percentage", sub: "Changes expected allowed on lines delivered by a PTA", has: contracts.some((c) => c.ptaPct != null), get: contracts.some((c) => c.ptaPct != null) && contracts.filter((c) => c.ptaPct != null).every((c) => !!ruleOn[c.id + ":pta"]) },
    { k: "state", label: "Hold claims that break a state or license rule", sub: "Feeds claim edits, such as the Massachusetts supervising PT rule", has: tf("State").length > 0, get: tf("State").length > 0 && tf("State").every((t) => !!createdTerms[t.id]) },
    { k: "auth", label: "Require authorization at visit limits", sub: "Feeds scheduling and authorization", has: tf("Authorization").length > 0, get: tf("Authorization").length > 0 && tf("Authorization").every((t) => !!createdTerms[t.id]) },
  ];
  const cur = Object.fromEntries(DEFS.map((d) => [d.k, d.get]));
  const dirty = draft && DEFS.some((d) => d.has && draft[d.k] !== cur[d.k]);
  const openSettings = () => { if (pop === "settings") return close(); setDraft(cur); setShowHist(false); setPv("root"); setPop("settings"); };
  const rulesOn = DEFS.filter((d) => d.has && d.get).length, rulesTotal = DEFS.filter((d) => d.has).length;
  const saveSettings = () => {
    const changed = DEFS.filter((d) => d.has && draft[d.k] !== cur[d.k]);
    setRuleOn((p) => { const n = { ...p }; contracts.forEach((c) => { if (c.escalatorPct) n[c.id + ":escalator"] = draft.escalator; if (c.ptaPct != null) n[c.id + ":pta"] = draft.pta; }); return n; });
    setCreatedTerms((p) => { const n = { ...p }; tf("State").forEach((t) => { n[t.id] = draft.state; }); tf("Authorization").forEach((t) => { n[t.id] = draft.auth; }); return n; });
    setRuleLog((l) => [...changed.map((d) => ({ d: fmtDate(TODAY), t: d.label + ": " + (draft[d.k] ? "on" : "off") })), ...l]);
    toast("Table settings saved"); close();
  };

  /* filters, search and grouping */
  const kinds = [...new Set(filters.map((f) => f.k))];
  const matchF = (k, v, r) => (k === "payer" ? cmap[r.contractId].masterPayer === v : k === "group" ? r.payerGroup === v : r.method === v);
  let rows = sorted.flatMap((c) => c.rows).filter((r) => kinds.every((k) => filters.filter((f) => f.k === k).some((f) => matchF(k, f.v, r))));
  if (q) rows = rows.filter((r) => (r.payer + r.plan + r.cpt + (r.svc || "") + r.planType + r.facility + r.state + cmap[r.contractId].number + cmap[r.contractId].masterPayer).toLowerCase().includes(q.toLowerCase()));
  const groups = [];
  if (groupBy === "none") groups.push({ key: "all", name: null, rows });
  else rows.forEach((r) => {
    const c = cmap[r.contractId];
    const key = groupBy === "contract" ? c.id : c.masterPayer;
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, name: groupBy === "contract" ? c.number : c.masterPayer, contract: groupBy === "contract" ? c : null, rows: [] }; groups.push(g); }
    g.rows.push(r);
  });
  const vcols = COLS.filter(([k]) => cols[k]);
  const allRows = contracts.flatMap((c) => c.rows);
  const filterOpts = [
    ["payer", "Master payer", [...new Set(contracts.map((c) => c.masterPayer))].map((v) => [v, v])],
    ["group", "Payer group", [...new Set(allRows.map((r) => r.payerGroup))].map((v) => [v, v])],
    ["method", "Method", [...new Set(allRows.map((r) => r.method))].map((v) => [v, METHOD[v]])],
  ];
  const drow = drawerRow ? allRows.find((r) => r.id === drawerRow) : null;
  const tcon = termsFor ? cmap[termsFor] : null;
  const nSel = rows.filter((r) => selected[r.id]).length;
  const allOn = rows.length > 0 && nSel === rows.length;
  const toggleAll = () => setSelected(allOn ? {} : Object.fromEntries(rows.map((r) => [r.id, true])));
  const exportCsv = () => { const pick = rows.filter((r) => selected[r.id]); downloadCsv("contracts.csv", vcols.map(([, l]) => l), pick.map((r) => vcols.map(([k]) => PLAIN[k](r, cmap[r.contractId], ruleOn)))); toast(`Exported ${pick.length} row${pick.length === 1 ? "" : "s"} to contracts.csv`); };

  const config = (
    <div className="popwrap" ref={sRef}>
      <button className={"tgl" + (pop === "settings" ? " on" : "")} aria-label="Table configuration" aria-haspopup="dialog" aria-expanded={pop === "settings"} onClick={openSettings}><Settings size={16} /></button>
      {pop === "settings" && draft && (
        <div className="pop settings" role="dialog" aria-label="Table configuration">
          {pv === "root" && (
            <>
              <div className="cfg-s">
                <div className="dprow"><span>Grouping</span><select className="fsel" aria-label="Grouping" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}><option value="contract">Contract</option><option value="payer">Master payer</option><option value="none">None</option></select></div>
              </div>
              <div className="cfg-m">
                <button className="mi" onClick={() => setPv("columns")}><span className="mi-t"><span>Columns</span><span className="mi-s">{vcols.length} of {COLS.length} shown</span></span><ChevronRight size={20} /></button>
                <button className="mi" onClick={() => setPv("rules")}><span className="mi-t"><span>Rules</span><span className="mi-s">{rulesOn} of {rulesTotal} on</span></span><ChevronRight size={20} /></button>
              </div>
            </>
          )}
          {pv === "columns" && (
            <>
              <div className="cfg-h"><button className="icon" aria-label="Back" onClick={() => setPv("root")}><ChevronLeft size={18} /></button><span className="b">Columns</span></div>
              <div className="cfg-b">{COLS.map(([k, l]) => <label key={k} className="crowc"><input type="checkbox" checked={cols[k]} disabled={cols[k] && vcols.length === 1} onChange={(e) => setCols({ ...cols, [k]: e.target.checked })} />{l}</label>)}</div>
            </>
          )}
          {pv === "rules" && (
            <>
              <div className="cfg-h"><button className="icon" aria-label="Back" onClick={() => setPv("root")}><ChevronLeft size={18} /></button><span className="b">Rules</span></div>
              <div className="cfg-b rules">
                {DEFS.map((d) => (
                  <div key={d.k} className={"prow2" + (d.has ? "" : " dis")}>
                    <div><div>{d.label}</div><div className="sub2">{d.has ? d.sub : "No matching terms on file yet"}</div></div>
                    <Switch on={!!draft[d.k]} disabled={!d.has} label={d.label} onChange={(v) => setDraft({ ...draft, [d.k]: v })} />
                  </div>
                ))}
              </div>
              {showHist && (
                <div className="hist">{ruleLog.length ? ruleLog.map((h, i) => <div key={i}><span className="muted">{h.d}</span><span>{h.t}</span></div>) : <span className="muted">No changes yet</span>}</div>
              )}
              <div className="pfoot"><button className="link" onClick={() => setShowHist(!showHist)}>{showHist ? "Hide history" : "View history"}</button>
                <button className="btn primary" disabled={!dirty} onClick={saveSettings}>Save</button></div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="page fillpage tp">
      <TableHeaderBar title="Contracts" viewLabel={`All Contracts (${contracts.length})`} filterOn={showFilters} onFilter={() => setShowFilters(!showFilters)} config={config}
        action={<AddContractButton onAdd={() => onUpload("pdf")} onImport={() => onUpload("csv")} />} q={q} setQ={setQ}
        extra={nSel > 0 && <span className="selbar"><b>{nSel} selected</b><button className="link" onClick={exportCsv}>Export CSV</button><button className="link" onClick={() => setSelected({})}>Clear</button></span>} />
      {showFilters && <FilterRow opts={filterOpts} filters={filters} setFilters={setFilters} onHide={() => setShowFilters(false)} />}

      <div className="tblwrap fill">
        <table className="gtbl">
          <thead><tr>
            <th className="sel"><input type="checkbox" aria-label="Select all rates" ref={(el) => { if (el) el.indeterminate = nSel > 0 && !allOn; }} checked={allOn} disabled={!rows.length} onChange={toggleAll} /></th>
            {vcols.map(([k, l]) => <th key={k} className={RIGHT[k] ? "r" : ""}>{l}</th>)}
          </tr></thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.key}>
                {g.name != null && (
                  <tr className="grow2"><td colSpan={vcols.length + 1}>
                    <div className="ginner">
                      <button className="gcol" aria-label={collapsed[g.key] ? "Expand group" : "Collapse group"} aria-expanded={!collapsed[g.key]} onClick={() => setCollapsed({ ...collapsed, [g.key]: !collapsed[g.key] })}>{collapsed[g.key] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                      <span className="gname">{g.name}</span>
                      <span className="ginfo">{g.contract ? `${g.contract.masterPayer}, ${g.contract.effectiveStart ? (g.contract.effectiveEnd ? fmtDate(g.contract.effectiveStart) + " to " + fmtDate(g.contract.effectiveEnd) : "from " + fmtDate(g.contract.effectiveStart)) : "dates not stated"}, ${g.rows.length} rates` : `${g.rows.length} rates`}</span>
                      {g.contract && (
                        <span className="gact">
                          <button className="gbtn" aria-label={"Open " + g.contract.file} title={g.contract.file} onClick={() => openDoc(g.contract.id, null)}><FileText size={14} /></button>
                          <button className="gbtn" aria-label={"Terms for " + g.name} title="Contract terms" onClick={() => { setDrawerRow(null); setTermsFor(g.contract.id); }}><ListChecks size={14} /></button>
                        </span>
                      )}
                    </div>
                  </td></tr>
                )}
                {!collapsed[g.key] && g.rows.map((r) => (
                  <tr key={r.id} className={"drow clickrow" + (drawerRow === r.id ? " active" : "")} onClick={() => { setTermsFor(null); setDrawerRow(r.id); }} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setDrawerRow(r.id)}>
                    <td className="sel" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={"Select " + r.svc} checked={!!selected[r.id]} onChange={(e) => setSelected({ ...selected, [r.id]: e.target.checked })} /></td>
                    {vcols.map(([k]) => <td key={k} className={RIGHT[k] ? "r" : ""}>{CELLS[k](r, cmap[r.contractId], ruleOn)}</td>)}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {!rows.length && <tr><td colSpan={vcols.length + 1} className="empty">No contracts match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {drow && <ExpectedDrawer row={drow} contract={cmap[drow.contractId]} ruleOn={ruleOn} setRuleOn={setRuleOn} onClose={() => setDrawerRow(null)} openDoc={openDoc} claims={claims} />}
      {tcon && <TermsDrawer contract={tcon} ruleOn={ruleOn} createdTerms={createdTerms} onClose={() => setTermsFor(null)} openDoc={openDoc} />}
    </div>
  );
}

/* ---------- Contract Management: Fee schedules ---------- */
function deriveSchedules(contracts) {
  const out = {};
  contracts.forEach((c) => {
    if (c.kind === "generic" || !c.feeSchedules) return;
    Object.entries(c.feeSchedules).forEach(([letter, amts]) => {
      if (!c.plans.some((p) => p.feeSchedule === letter)) return;
      const year = (c.effectiveStart || "").slice(0, 4);
      const name = letter === "C" ? "Medicare Physician Fee Schedule (national amounts)" : letter === "M" ? `${c.masterPayer} Medicaid fee schedule` : `${c.masterPayer} outpatient therapy fee schedule${year ? ", " + year : ""}`;
      const s = out[name] || (out[name] = { name, amounts: amts, usedBy: [], payer: letter === "C" ? "Medicare reference" : c.masterPayer, effective: c.effectiveStart || "", source: "contract" });
      if (!s.usedBy.includes(c.number)) s.usedBy.push(c.number);
    });
  });
  return Object.values(out);
}
const FEE_COLS = [["cpt", "CPT"], ["svc", "Service"], ["amt", "Fee schedule amount"], ["chg", "Charge master"], ["pct", "% of charge"], ["used", "Used by"]];
function FeeSchedulesPage({ contracts, schedules, rawContracts, onLoad }) {
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [cols, setCols] = useState(() => Object.fromEntries(FEE_COLS.map(([k]) => [k, true])));
  const [collapsed, setCollapsed] = useState({});
  const loaded = schedules.map((s) => ({ ...s, payer: "Loaded file", source: "file", usedBy: [...new Set(contracts.flatMap((c) => c.rows.filter((r) => r.basisResolved === s.name).map(() => c.number)))] }));
  const all = [...deriveSchedules(contracts), ...loaded];
  const missing = unresolvedBases(rawContracts, schedules);
  const opts = [["payer", "Source", [...new Set(all.map((s) => s.payer))].map((v) => [v, v])]];
  const list = all.filter((s) => filters.length === 0 || filters.some((f) => f.v === s.payer));
  const vcols = FEE_COLS.filter(([k]) => cols[k]);
  const rowsOf = (s) => CPT_LIST.filter((c) => s.amounts[c] != null).map((c) => ({ cpt: c, svc: CPT[c], amt: s.amounts[c], chg: CHARGE[c], pct: Math.round((s.amounts[c] / CHARGE[c]) * 100), used: s.usedBy.join(", ") || "Not used yet" })).filter((r) => !q || (r.cpt + r.svc + s.name).toLowerCase().includes(q.toLowerCase()));
  const groups = list.map((s) => ({ s, rows: rowsOf(s) })).filter((g) => g.rows.length);
  const cell = { cpt: (r) => r.cpt, svc: (r) => r.svc, amt: (r) => fmt(r.amt), chg: (r) => fmt(r.chg), pct: (r) => r.pct + "%", used: (r) => <Cut w={260}>{r.used}</Cut> };
  return (
    <div className="page fillpage tp">
      <TableHeaderBar title="Fee schedules" viewLabel={`All Fee schedules (${all.length})`} filterOn={showFilters} onFilter={() => setShowFilters(!showFilters)} config={<ColumnsConfig defs={FEE_COLS} cols={cols} setCols={setCols} />}
        action={<button className="btn primary" onClick={() => onLoad(null)}><Plus size={16} />Add Fee Schedule</button>} q={q} setQ={setQ} />
      {showFilters && <FilterRow opts={opts} filters={filters} setFilters={setFilters} onHide={() => setShowFilters(false)} />}
      {missing.map((m) => (
        <div key={m.basis} className="banner amber"><AlertTriangle size={16} /><span><b>{m.basis}</b> is not loaded. {m.rows} rate{m.rows > 1 ? "s" : ""} in {m.numbers.join(", ")} point{m.rows > 1 ? "" : "s"} at it, so expected allowed shows n/a.</span><button className="btn" onClick={() => onLoad(m.basis)}>Load it</button></div>
      ))}
      <div className="tblwrap fill">
        <table className="gtbl">
          <thead><tr>{vcols.map(([k, l]) => <th key={k} className={k === "amt" || k === "chg" || k === "pct" ? "r" : ""}>{l}</th>)}</tr></thead>
          <tbody>
            {groups.map(({ s, rows }) => (
              <React.Fragment key={s.name}>
                <tr className="grow2"><td colSpan={vcols.length}>
                  <div className="ginner">
                    <button className="gcol" aria-label={collapsed[s.name] ? "Expand group" : "Collapse group"} aria-expanded={!collapsed[s.name]} onClick={() => setCollapsed({ ...collapsed, [s.name]: !collapsed[s.name] })}>{collapsed[s.name] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                    <span className="gname">{s.name}</span>
                    <span className="ginfo">{rows.length} codes, {s.source === "file" ? `loaded from ${s.file}${s.effective ? ", effective " + fmtDate(s.effective) : ""}` : "from a contract"}, used by {s.usedBy.length} contract{s.usedBy.length === 1 ? "" : "s"}</span>
                    {s.source === "file" && <Chip tone="teal">Loaded file</Chip>}
                  </div>
                </td></tr>
                {!collapsed[s.name] && rows.map((r) => (
                  <tr key={s.name + r.cpt} className="drow">{vcols.map(([k]) => <td key={k} className={k === "amt" || k === "chg" || k === "pct" ? "r" : ""}>{cell[k](r)}</td>)}</tr>
                ))}
              </React.Fragment>
            ))}
            {!groups.length && <tr><td colSpan={vcols.length} className="empty">No fee schedules match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Contract Management: Payer Hierarchy ---------- */
const HIER_COLS = [["payer", "Payer"], ["group", "Payer group"], ["plan", "Plan"], ["ptype", "Plan type"], ["contract", "Contract"], ["rates", "Rates"], ["method", "Payment method"]];
function PayerHierarchyPage({ contracts }) {
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [cols, setCols] = useState(() => Object.fromEntries(HIER_COLS.map(([k]) => [k, true])));
  const [collapsed, setCollapsed] = useState({});
  const flat = contracts.flatMap((c) => c.plans.map((p) => ({ master: c.masterPayer, payer: p.payer, group: p.payerGroup, plan: p.plan, ptype: p.planType || "n/a", contract: c.number, rates: c.rows.filter((r) => r.plan === p.plan).length, method: [...new Set(c.rows.filter((r) => r.plan === p.plan).map((r) => METHOD[r.method]))].join(", ") })));
  const opts = [["group", "Payer group", [...new Set(flat.map((r) => r.group))].map((v) => [v, v])]];
  const rows = flat.filter((r) => filters.length === 0 || filters.some((f) => f.v === r.group)).filter((r) => !q || (r.master + r.payer + r.plan + r.ptype + r.contract).toLowerCase().includes(q.toLowerCase()));
  const groups = []; rows.forEach((r) => { let g = groups.find((x) => x.name === r.master); if (!g) { g = { name: r.master, rows: [] }; groups.push(g); } g.rows.push(r); });
  groups.sort((a, b) => a.name.localeCompare(b.name));
  const vcols = HIER_COLS.filter(([k]) => cols[k]);
  const cell = { payer: (r) => r.payer, group: (r) => <Chip tone={toneOf(r.group)}>{r.group}</Chip>, plan: (r) => <span className="b">{r.plan}</span>, ptype: (r) => <Cut w={200}>{r.ptype}</Cut>, contract: (r) => r.contract, rates: (r) => r.rates, method: (r) => <Cut w={260}>{r.method}</Cut> };
  return (
    <div className="page fillpage tp">
      <TableHeaderBar title="Payer Hierarchy" viewLabel={`All Payers (${[...new Set(flat.map((r) => r.master))].length})`} filterOn={showFilters} onFilter={() => setShowFilters(!showFilters)} config={<ColumnsConfig defs={HIER_COLS} cols={cols} setCols={setCols} />} q={q} setQ={setQ} />
      {showFilters && <FilterRow opts={opts} filters={filters} setFilters={setFilters} onHide={() => setShowFilters(false)} />}
      <div className="tblwrap fill">
        <table className="gtbl">
          <thead><tr>{vcols.map(([k, l]) => <th key={k} className={k === "rates" ? "r" : ""}>{l}</th>)}</tr></thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.name}>
                <tr className="grow2"><td colSpan={vcols.length}>
                  <div className="ginner">
                    <button className="gcol" aria-label={collapsed[g.name] ? "Expand group" : "Collapse group"} aria-expanded={!collapsed[g.name]} onClick={() => setCollapsed({ ...collapsed, [g.name]: !collapsed[g.name] })}>{collapsed[g.name] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                    <span className="gname">{g.name}</span><span className="ginfo">Master payer, {g.rows.length} plan{g.rows.length === 1 ? "" : "s"}</span>
                  </div>
                </td></tr>
                {!collapsed[g.name] && g.rows.map((r, i) => <tr key={g.name + r.plan + i} className="drow">{vcols.map(([k]) => <td key={k} className={k === "rates" ? "r" : ""}>{cell[k](r)}</td>)}</tr>)}
              </React.Fragment>
            ))}
            {!groups.length && <tr><td colSpan={vcols.length} className="empty">No payers match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Contract Management: Documents ---------- */
const DOC_COLS = [["file", "File"], ["contract", "Contract"], ["payer", "Master payer"], ["pages", "Pages"], ["term", "Effective"], ["uploaded", "Uploaded"], ["qa", "QA"]];
function DocumentsPage({ contracts, openDoc, onUpload }) {
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [cols, setCols] = useState(() => Object.fromEntries(DOC_COLS.map(([k]) => [k, true])));
  const opts = [["payer", "Master payer", [...new Set(contracts.map((c) => c.masterPayer))].map((v) => [v, v])]];
  const rows = [...contracts].sort((a, b) => a.masterPayer.localeCompare(b.masterPayer)).filter((c) => filters.length === 0 || filters.some((f) => f.v === c.masterPayer)).filter((c) => !q || (c.file + c.number + c.masterPayer).toLowerCase().includes(q.toLowerCase()));
  const vcols = DOC_COLS.filter(([k]) => cols[k]);
  const cell = {
    file: (c) => <span className="b"><FileText size={14} className="inl" /><Cut w={300}>{c.file}</Cut></span>, contract: (c) => c.number, payer: (c) => c.masterPayer, pages: (c) => (c.pages || "n/a"),
    term: (c) => <span className="nowrap">{c.effectiveStart ? fmtDate(c.effectiveStart) + (c.effectiveEnd ? " to " + fmtDate(c.effectiveEnd) : "") : "n/a"}</span>, uploaded: (c) => c.uploaded, qa: () => <Chip tone="moss"><Check size={12} />Verified</Chip>,
  };
  return (
    <div className="page fillpage tp">
      <TableHeaderBar title="Documents" viewLabel={`All Documents (${contracts.length})`} filterOn={showFilters} onFilter={() => setShowFilters(!showFilters)} config={<ColumnsConfig defs={DOC_COLS} cols={cols} setCols={setCols} />}
        action={<button className="btn primary" onClick={() => onUpload("pdf")}><Plus size={16} />Add Contract</button>} q={q} setQ={setQ} />
      {showFilters && <FilterRow opts={opts} filters={filters} setFilters={setFilters} onHide={() => setShowFilters(false)} />}
      <div className="tblwrap fill">
        <table className="gtbl">
          <thead><tr>{vcols.map(([k, l]) => <th key={k} className={k === "pages" ? "r" : ""}>{l}</th>)}</tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="drow clickrow" onClick={() => openDoc(c.id, null)}>
                {vcols.map(([k]) => <td key={k} className={k === "pages" ? "r" : ""}>{cell[k](c)}</td>)}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={vcols.length} className="empty">No documents match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TermsDrawer({ contract, ruleOn, createdTerms, onClose, openDoc }) {
  return (
    <div className="drawer" role="dialog" aria-label="Contract terms">
      <div className="drawer-head"><div><div className="crumb">Contract terms</div><div className="h2">{contract.number}</div><div className="muted">{contract.masterPayer}</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="drawer-body">
        {contract.terms.map((t) => {
          const active = t.ruleKey ? !!ruleOn[contract.id + ":" + t.ruleKey] : !!createdTerms[t.id];
          return (
            <div key={t.id} className="term">
              <div className="term-top"><Chip tone="grey">{t.category}</Chip><span className="b">{t.section ? "Section " + t.section : t.category}</span><span className="grow" />{(t.ruleKey || t.when) ? (active ? <Chip tone="moss"><Check size={12} />Rule on</Chip> : <Chip tone="grey">Rule off</Chip>) : (t.page ? <span className="muted">Page {t.page}</span> : null)}</div>
              <div>{t.summary}</div>
              {t.when && <div className="muted small mt4">When: {t.when}. Then: {t.then}.</div>}
              {t.source && (contract.id === "cascadia" || contract.bytes) && <button className="link" onClick={() => openDoc(contract.id, t.source, t.page)}>View in contract</button>}
            </div>
          );
        })}
        <div className="note"><Info size={14} /><span>Rules are managed in the table settings, behind the gear icon above the contracts table.</span></div>
      </div>
    </div>
  );
}

function ExpectedDrawer({ row, contract, ruleOn, setRuleOn, onClose, openDoc, claims }) {
  const [year, setYear] = useState("2026-08-14");
  const [cq, setCq] = useState(false);
  const r = calcUnit(row, contract, year, ruleOn, cq);
  const used = claims.filter((c) => c.contractId === contract.id && c.planKey && row.plan.toLowerCase().includes(c.planKey));
  const under = used.filter((c) => c.status === "underpaid");
  return (
    <div className="drawer" role="dialog" aria-label="Expected allowed calculation">
      <div className="drawer-head"><div><div className="crumb">Expected allowed</div><div className="h2">{contract.kind === "generic" ? row.svc : row.plan + ", " + (row.cpt === "All PT codes" ? "all PT codes" : "CPT " + row.cpt)}</div>
        <div className="muted">{row.payer}. {contract.kind === "generic" ? row.plan + (row.year ? ", year " + row.year : "") : row.cpt !== "All PT codes" && CPT[row.cpt]}</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="drawer-body">
        <div className="whatif" style={contract.kind === "generic" ? { display: "none" } : undefined}>
          <div><div className="k">Date of service</div>
            <div className="seg"><button className={year < "2026" ? "on" : ""} onClick={() => setYear("2025-08-14")}>2025</button><button className={year >= "2026" ? "on" : ""} onClick={() => setYear("2026-08-14")}>2026</button></div></div>
          <div><div className="k">Delivered by</div>
            <div className="seg"><button className={!cq ? "on" : ""} onClick={() => setCq(false)}>PT</button><button className={cq ? "on" : ""} onClick={() => setCq(true)}>PTA (CQ)</button></div></div>
        </div>
        <div className="chain">
          {r.steps.map((s, i) => (
            <div key={i} className={"node" + (s.rule ? " rule" : "") + (s.rule && !s.active ? " off" : "")}>
              <div className="node-main"><div className="b">{s.label}</div><div className="muted">{s.note}</div></div>
              {s.rule && <Chip tone={s.active ? "moss" : "grey"}>{s.active ? "Rule on" : "Rule off"}</Chip>}
              <div className="node-v">{fmt(s.value)}</div>
            </div>
          ))}
          <div className="node total"><div className="node-main"><div className="b">Expected allowed</div><div className="muted">{unitSuffix(row)}</div></div><div className="node-v">{fmt(r.amount)}</div></div>
        </div>
        <div className="note"><Info size={14} /><span>Each step is a rule that runs when a payment posts. Rules are managed in the table settings, behind the gear icon above the contracts table.</span></div>
        <div className="impact" style={contract.kind === "generic" ? { display: "none" } : undefined}>
          <div><div className="kv">{used.length}</div><div className="kl">claims use this plan</div></div>
          <div><div className="kv">{under.length}</div><div className="kl">underpaid against it</div></div>
          <div><div className="kv">{fmt(under.reduce((s, c) => s + c.variance, 0))}</div><div className="kl">variance found</div></div>
        </div>
        {row.source && (contract.id === "cascadia" || contract.bytes) && <button className="btn" onClick={() => openDoc(contract.id, row.source, row.page)}><FileText size={14} />Show source in contract</button>}
      </div>
    </div>
  );
}

function DocModal({ doc, contracts, onClose }) {
  const c = contracts.find((x) => x.id === doc.id);
  const view = usePdfView(c && c.bytes);
  const hit = useMemo(() => (view.status === "ready" && doc.hl ? findInIndex(view.index, doc.hl, 0, doc.page) || findInIndex(view.index, firstWords(doc.hl, 4), 0, doc.page) : null), [view, doc]);
  const rects = useMemo(() => rectsFromHits([], hit), [hit]);
  const marks = doc.hl ? computeMarks(CONTRACT_TEXT, [doc.hl]) : [];
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card doc">
        <div className="modal-head"><div><div className="h2">{c ? c.file : "Contract"}</div><div className="muted">{c ? c.masterPayer : ""}</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="docbody">
          {view.status === "ready" ? <PdfPane pdf={view.pdf} index={view.index} rectsByPage={rects} focusPage={hit ? hit.page : null} nonce={1} zoom={100} />
            : view.status === "loading" ? <div className="docscroll"><div className="paper pdfcard"><Loader2 size={22} className="spin" /><div className="muted">Opening the document</div></div></div>
            : doc.id === "cascadia" ? <DocPane text={CONTRACT_TEXT} marks={marks} activeIdx={0} title={c ? c.file : ""} />
            : <div className="docscroll"><div className="paper pdfcard"><FileText size={28} /><div className="b">{c ? c.file : ""}</div><div className="muted">The stored PDF opens here in the product. This prototype keeps documents you upload during the session.</div></div></div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Claims
   ============================================================ */
const statusChip = (d) => {
  if (d.appeal) return <Chip tone={d.appeal.status === "Won" ? "moss" : d.appeal.status === "Denied" ? "rust" : "navy"}>{d.appeal.status === "Submitted" ? "Appeal submitted" : d.appeal.status === "Won" ? "Recovered" : "Appeal denied"}</Chip>;
  if (d.status === "no_contract") return <Chip tone="grey">No contract on file</Chip>;
  if (d.status === "underpaid") return <Chip tone="rust">Underpaid</Chip>;
  return <Chip tone="grey">Paid as expected</Chip>;
};

function ClaimsPage({ claims, view, setView, sel, setSel, openClaim, setOpenClaim, startAppeal, loaded, goLoad }) {
  const underpaid = claims.filter((c) => c.status === "underpaid");
  const appealed = claims.filter((c) => c.appeal);
  const noContract = claims.filter((c) => c.status === "no_contract");
  let list = view === "all" ? [...claims].sort((a, b) => (a.dos < b.dos ? 1 : -1)) : view === "appealed" ? appealed : [...underpaid].sort((a, b) => b.recover - a.recover || b.variance - a.variance);
  const shown = list.slice(0, 60);
  const closing = underpaid.filter((c) => !c.appeal && c.daysLeft >= 0 && c.daysLeft <= 30);
  const eligible = underpaid.filter((c) => !c.appeal && c.daysLeft >= 0);
  const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const selectable = shown.filter((c) => !c.appeal && c.daysLeft >= 0);
  const allOn = selectable.length > 0 && selectable.every((c) => sel.includes(c.id));
  const someOn = selectable.some((c) => sel.includes(c.id));
  const toggleAll = () => setSel(allOn ? sel.filter((id) => !selectable.some((c) => c.id === id)) : [...new Set([...sel, ...selectable.map((c) => c.id)])]);
  const high = eligible.filter((c) => c.level === "High");

  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Claims</h1></div></div>
      {!loaded && noContract.length > 0 && (
        <div className="banner amber"><AlertTriangle size={16} /><span><b>{noContract.length} Cascadia claims</b> have no contract on file, so expected allowed cannot be calculated and underpayments are invisible.</span><button className="btn" onClick={goLoad}>Load the contract</button></div>
      )}
      <div className="tabs page-tabs">
        <button className={view === "all" ? "on" : ""} onClick={() => setView("all")}>All claims <span className="cnt">{claims.length}</span></button>
        <button className={view === "underpaid" ? "on" : ""} onClick={() => setView("underpaid")}>Underpaid <Chip tone="grey">Custom view</Chip> <span className="cnt">{underpaid.length}</span></button>
        <button className={view === "appealed" ? "on" : ""} onClick={() => setView("appealed")}>Appealed <span className="cnt">{appealed.length}</span></button>
      </div>
      {view === "underpaid" && (
        <div className="summary">
          <div><div className="kv">{fmt(underpaid.reduce((s, c) => s + c.variance, 0))}</div><div className="kl">underpaid across {underpaid.length} claims</div></div>
          <div><div className="kv">{fmt(eligible.reduce((s, c) => s + c.recover, 0))}</div><div className="kl">expected recovery, open windows</div></div>
          <div><div className="kv">{closing.length}</div><div className="kl">appeal windows close within 30 days ({fmt(closing.reduce((s, c) => s + c.variance, 0))})</div></div>
          <div className="grow" />
          <div className="row gap">
            <button className="btn" disabled={!high.length} onClick={() => setSel(high.map((c) => c.id))}>Select high recoverability ({high.length})</button>
            <button className="btn primary" disabled={!sel.length} onClick={() => startAppeal(sel)}><Send size={14} />Appeal {sel.length || ""} selected</button>
          </div>
        </div>
      )}
      <div className="tblwrap tall">
        <table className="tbl claims">
          <thead><tr>{view === "underpaid" && <th><input type="checkbox" aria-label="Select all claims with an open appeal window" title="Select all claims that can still be appealed" ref={(el) => { if (el) el.indeterminate = someOn && !allOn; }} checked={allOn} disabled={!selectable.length} onChange={toggleAll} /></th>}<th>Claim</th><th>Service date</th><th>Facility</th><th>Payer and plan</th><th className="r">Billed</th><th className="r">Expected</th><th className="r">Paid (835)</th><th className="r">Variance</th><th>Recoverability</th><th>Appeal by</th><th>Status</th></tr></thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} className="clickrow" onClick={() => setOpenClaim(c.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpenClaim(c.id)}>
                {view === "underpaid" && <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={"Select " + c.id} disabled={!!c.appeal || c.daysLeft < 0} checked={sel.includes(c.id)} onChange={() => toggle(c.id)} /></td>}
                <td className="b nowrap">{c.id}</td><td className="nowrap">{fmtDate(c.dos)}</td><td>{c.facility}, {c.state}</td><td>{c.master}<span className="sub">{c.plan}</span></td>
                <td className="r">{fmt(c.billed)}</td><td className="r">{c.expected == null ? <span className="muted">n/a</span> : fmt(c.expected)}</td><td className="r">{fmt(c.paid)}</td>
                <td className={"r b" + (c.variance ? " neg" : "")}>{c.variance ? "-" + fmt(c.variance) : c.status === "no_contract" ? "" : fmt(0)}</td>
                <td>{c.status === "underpaid" ? <span><Chip tone={levelTone[c.level]}>{c.level}</Chip><span className="sub">{c.level === "Closed" ? "Window closed" : "Expect " + fmt(c.recover)}</span></span> : ""}</td>
                <td className="nowrap">{c.status === "underpaid" ? <span className={c.daysLeft < 0 ? "neg" : c.daysLeft <= 30 ? "warn" : ""}>{c.daysLeft < 0 ? "Closed" : c.daysLeft + " days"}</span> : ""}</td>
                <td>{statusChip(c)}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={12} className="empty">{view === "appealed" ? "No appeals yet. Select underpaid claims and choose Appeal." : "Nothing here."}</td></tr>}
          </tbody>
        </table>
        {list.length > shown.length && <div className="muted pad">Showing the first {shown.length} of {list.length} claims.</div>}
      </div>
    </div>
  );
}

function ClaimFlyout({ d, onClose, startAppeal, openDoc }) {
  const term = d.contract ? (d.pattern === "escalator" ? d.contract.terms.find((t) => t.ruleKey === "escalator") : d.pattern === "pta" ? d.contract.terms.find((t) => t.ruleKey === "pta") : d.contract.terms.find((t) => t.category === "Appeals")) : null;
  return (
    <div className="drawer wide" role="dialog" aria-label="Claim detail">
      <div className="drawer-head"><div><div className="crumb">Claim</div><div className="h2">{d.id}</div><div className="muted">Patient {d.pid} ({d.patient}). {d.apptType}, {d.facility} {d.state}. Service date {fmtDate(d.dos)}.</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="drawer-body">
        <div className="row gap wrap">{statusChip(d)}<span className="muted">{d.master}, {d.plan}</span>{d.status === "underpaid" && <Chip tone={levelTone[d.level]}>{d.level} recoverability</Chip>}</div>
        <div className="facts">
          <div><div className="k">Billed</div><div className="v">{fmt(d.billed)}</div></div>
          <div><div className="k">Expected allowed</div><div className="v">{d.expected == null ? "n/a" : fmt(d.expected)}</div></div>
          <div><div className="k">Paid on 835</div><div className="v">{fmt(d.paid)}</div></div>
          <div><div className="k">Variance</div><div className={"v" + (d.variance ? " neg" : "")}>{d.variance ? "-" + fmt(d.variance) : fmt(0)}</div></div>
        </div>
        <table className="tbl compact"><thead><tr><th>CPT</th><th>Service</th><th className="r">Units</th><th className="r">Expected</th><th className="r">Paid</th><th className="r">Variance</th></tr></thead>
          <tbody>{d.lines.map((l, i) => { const e = d.lineExp[i]; const v = e == null ? null : r2(e - l.paid); return (
            <tr key={i}><td className="b">{l.cpt}{l.cq ? <Chip tone="grey">CQ</Chip> : null}</td><td>{CPT[l.cpt]}</td><td className="r">{l.units}</td><td className="r">{e == null ? "n/a" : fmt(e)}</td><td className="r">{fmt(l.paid)}</td><td className={"r" + (v > 0.005 ? " neg b" : "")}>{v == null ? "" : v > 0.005 ? "-" + fmt(v) : fmt(0)}</td></tr>); })}</tbody></table>
        {d.status === "underpaid" && (
          <div className="why"><div className="b">Why this was flagged</div><div>{d.reason}</div><div className="muted">835 adjustment {PATTERN[d.pattern] ? PATTERN[d.pattern].carc : "CO-45"} on remittance {d.remitId}, posted {fmtDate(d.remitDate)}.</div></div>
        )}
        {d.contract && (
          <div className="ccard">
            <div className="row between"><div className="b">Contract on file</div>{d.contract.id === "cascadia" && <button className="link" onClick={() => openDoc(d.contract.id, term ? term.source : null)}>View contract</button>}</div>
            <div>{d.contract.masterPayer}, {d.plan}</div><div className="muted">Effective {fmtDate(d.contract.effectiveStart)} to {fmtDate(d.contract.effectiveEnd)}</div>
            {term && <div className="quote"><span className="b">Section {term.section}.</span> {term.summary}</div>}
          </div>
        )}
        {d.status === "underpaid" && <div className="muted">Appeal window closes {fmtDate(d.deadline)} ({d.daysLeft < 0 ? "closed" : d.daysLeft + " days left"}).</div>}
        <div className="row gap">
          {d.status === "underpaid" && !d.appeal && d.daysLeft >= 0 && <button className="btn primary" onClick={() => startAppeal([d.id])}><Send size={14} />Appeal underpayment</button>}
          {d.appeal && <Chip tone="navy">Appeal {d.appeal.id}, {d.appeal.status.toLowerCase()}</Chip>}
        </div>
      </div>
    </div>
  );
}

/* ---------- appeal letters ---------- */
function letterTemplate(d) {
  const lines = d.lines.map((l, i) => { const e = d.lineExp[i]; return `  CPT ${l.cpt}, ${l.units} unit${l.units > 1 ? "s" : ""}: contracted ${fmt(e)}, paid ${fmt(l.paid)}`; }).join("\n");
  const basis = d.pattern === "escalator" ? `Section ${(d.contract.terms.find((t) => t.ruleKey === "escalator") || {}).section || "4.3"} of our agreement increases contracted rates by ${d.contract.escalatorPct}% effective ${fmtDate(d.contract.escalatorStart)}. The remittance reflects the prior year rate.`
    : d.pattern === "pta" ? "Our agreement pays services delivered by a physical therapist assistant at 100% of the contracted rate. The remittance reduced CQ lines to 85%."
    : "We request a policy review of the edit applied to CPT 97530, which our fee schedule lists as separately payable.";
  return `Re: Underpayment dispute, claim ${d.id}\nPatient ID ${d.pid}, service date ${fmtDate(d.dos)}, remittance ${d.remitId} dated ${fmtDate(d.remitDate)}\n\nTo the Provider Disputes Department, ${d.master}:\n\n${basis}\n\nThe claim was paid ${fmt(d.paid)} against a contracted amount of ${fmt(d.expected)}, a shortfall of ${fmt(d.variance)}.\n\nLine detail:\n${lines}\n\nPlease reprocess the claim at the contracted rate and remit the difference. Supporting documents are attached.\n\nRidgeline Physical Therapy Group, Revenue Cycle`;
}

const AP_STEPS = ["Setup", "Cover Letter", "Payer Form", "Review and submit"];
const mdy = (s) => (s ? s.slice(5, 7) + "/" + s.slice(8, 10) + "/" + s.slice(0, 4) : "");
const kindOf = (n) => (/\.pdf$/i.test(n) ? ["PDF", "rust"] : /\.xlsx?$/i.test(n) ? ["XLS", "moss"] : /\.docx?$/i.test(n) ? ["DOC", "navy"] : ["IMG", "navy"]);
const sizeOf = (s) => 48 + (String(s).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 140);

function groupTemplate(g) {
  if (g.claims.length === 1) return letterTemplate(g.claims[0]);
  const c0 = g.claims[0];
  const basis = g.pattern === "escalator" ? `Our agreement increases contracted rates ${c0.contract.escalatorPct}% effective ${fmtDate(c0.contract.escalatorStart)}. The attached remittances reflect the prior year rate.`
    : g.pattern === "pta" ? "Our agreement pays services by a physical therapist assistant at 100% of the contracted rate. The attached remittances reduced CQ lines to 85%."
    : "We request a policy review of the edits listed in the attached worksheet.";
  return `Re: Underpayment dispute, ${g.claims.length} claims\n\nTo the Provider Disputes Department, ${g.master}:\n\n${basis}\n\nAn itemized worksheet lists each claim, remittance, contracted amount, paid amount, and shortfall. Total shortfall: ${fmt(r2(g.claims.reduce((s, c) => s + c.variance, 0)))}.\n\nPlease reprocess these claims at the contracted rate and remit the difference within 30 days. Supporting documents are attached.\n\nRidgeline Physical Therapy Group, Revenue Cycle`;
}

function AiBanner({ title, children }) {
  const [v, setV] = useState(null);
  return (
    <div className="aibanner">
      <Sparkles size={16} />
      <div className="grow"><div className="b">{title}</div>{children && <div className="muted small">{children}</div>}</div>
      <button className={"icon" + (v === "up" ? " sel" : "")} aria-label="Helpful" onClick={() => setV("up")}><ThumbsUp size={16} /></button>
      <button className={"icon" + (v === "down" ? " sel" : "")} aria-label="Not helpful" onClick={() => setV("down")}><ThumbsDown size={16} /></button>
    </div>
  );
}
function ACard({ title, right, children, startOpen = true }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <section className="acard">
      <div className="acard-h">
        <button className="acard-t" aria-expanded={open} onClick={() => setOpen(!open)}>{title}<ChevronDown size={16} className={open ? "" : "flipc"} /></button>
        {right}
      </div>
      {open && <div className="acard-b">{children}</div>}
    </section>
  );
}
function Fld({ label, value, onChange, readOnly, wide, area }) {
  return (
    <label className={"fld" + (wide ? " wide" : "") + (readOnly ? " ro" : "")}>
      <span>{label}</span>
      {area ? <textarea value={value} readOnly={readOnly} onChange={(e) => onChange && onChange(e.target.value)} rows={3} /> : <input value={value} readOnly={readOnly} onChange={(e) => onChange && onChange(e.target.value)} />}
    </label>
  );
}

function AppealPackageFlow({ ids, claims, onCancel, onSubmit, setAiHook, onViewAppeals }) {
  const all = ids.map((id) => claims.find((c) => c.id === id)).filter(Boolean);
  const bulk = all.length > 1;
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(null);
  const [menu, setMenu] = useState(false);
  const [skipped, setSkipped] = useState({});
  const [visited, setVisited] = useState({ 1: true });
  const [type, setType] = useState("full");
  const [off, setOff] = useState({});
  const [openRow, setOpenRow] = useState({});
  const [docOff, setDocOff] = useState({});
  const [extra, setExtra] = useState([]);
  const [docTab, setDocTab] = useState("All");
  const [gk, setGk] = useState(null);
  const [letters, setLetters] = useState({});
  const [forms, setForms] = useState({});
  const [zoom, setZoom] = useState(100);
  const [pv, setPv] = useState("Package");
  const [formType, setFormType] = useState("Provider payment dispute form");
  const menuRef = useRef(null);
  const fileRef = useRef(null);

  const items = all.filter((c) => !off[c.id]);
  const groups = useMemo(() => {
    const g = {};
    items.forEach((c) => { const k = c.master + "|" + c.pattern; (g[k] = g[k] || { key: k, master: c.master, pattern: c.pattern, claims: [] }).claims.push(c); });
    return Object.values(g);
  }, [items.map((c) => c.id).join()]);
  const active = groups.find((g) => g.key === gk) || groups[0];
  const sig = active ? active.claims.map((c) => c.id).join() : "";
  const disputed = r2(items.reduce((s, c) => s + c.variance, 0));
  const recover = r2(items.reduce((s, c) => s + c.recover, 0));
  const soonest = items.length ? [...items].sort((a, b) => a.daysLeft - b.daysLeft)[0] : null;

  const docs = useMemo(() => {
    const d = []; const seen = {};
    items.forEach((c) => {
      if (c.contract && !seen[c.contract.id]) { seen[c.contract.id] = 1; d.push({ id: "ct-" + c.contract.id, name: c.contract.file.replace(/\.pdf$/i, "") + "_excerpt.pdf", cat: "Contract", up: "11/16/2026", by: "Air", size: sizeOf(c.contract.id) + " KB", cid: c.contract.id }); }
    });
    items.forEach((c) => d.push({ id: "rm-" + c.id, name: c.remitId + "_" + c.id + ".pdf", cat: "Remittance", up: mdy(c.remitDate), by: "Remittance bot", size: sizeOf(c.id) + " KB", claim: c.id }));
    groups.forEach((g) => d.push({ id: "ws-" + g.key, name: "Variance_worksheet_" + g.master.split(" ")[0] + (g.pattern ? "_" + g.pattern : "") + ".xlsx", cat: "Worksheet", up: "11/16/2026", by: "Air", size: "18 KB" }));
    return [...d, ...extra];
  }, [items.map((c) => c.id).join(), extra.length]);
  const incl = (d) => !docOff[d.id];
  const chosen = docs.filter(incl);
  const checklist = [
    ["Claims selected", items.length > 0],
    ["Contract excerpt attached", items.length > 0 && items.every((c) => !c.contract || chosen.some((d) => d.cid === c.contract.id))],
    ["Remittance attached for every claim", items.length > 0 && items.every((c) => chosen.some((d) => d.claim === c.id))],
    ["Appeal window open", items.length > 0 && items.every((c) => c.daysLeft >= 0)],
  ];
  const doneCount = checklist.filter((x) => x[1]).length;

  const form = active ? (forms[active.key] && forms[active.key].sig === sig ? forms[active.key].v : null) : null;
  const termFor = (g) => { const c = g.claims[0]; return c.contract.terms.find((t) => t.ruleKey === (g.pattern === "escalator" ? "escalator" : g.pattern === "pta" ? "pta" : "__")) || c.contract.terms.find((t) => t.category === "Appeals"); };
  const defaults = (g) => {
    const cl = g.claims; const dos = cl.map((c) => c.dos).sort(); const rm = cl.map((c) => c.remitDate).sort(); const term = termFor(g);
    return {
      date: "11/16/2026", level: "First-level appeal", payer: g.master, plan: [...new Set(cl.map((c) => c.plan))].join(", "),
      provider: "Ridgeline Physical Therapy Group", tin: "12-3456789 / 1234567890", contact: "Appeals Team", phone: "(860) 555-0187", address: "100 Main Street, Suite 200, Hartford, CT 06103",
      claimIds: cl.length > 3 ? cl.slice(0, 3).map((c) => c.id).join(", ") + ` and ${cl.length - 3} more` : cl.map((c) => c.id).join(", "),
      claims: String(cl.length), service: mdy(dos[0]) + (dos.length > 1 ? " to " + mdy(dos[dos.length - 1]) : ""), remit: mdy(rm[0]) + (rm.length > 1 ? " to " + mdy(rm[rm.length - 1]) : ""),
      cpt: [...new Set(cl.flatMap((c) => c.lines.map((l) => l.cpt)))].join(", "), disputed: fmt(r2(cl.reduce((s, c) => s + c.variance, 0))),
      contractRef: (cl[0].contract.file) + (term ? ", Section " + term.section : ""), deadline: mdy(cl.map((c) => c.deadline).sort()[0]),
      why: PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid", explain: cl[0].reason,
    };
  };
  const f = form || (active ? defaults(active) : {});
  const setF = (k, v) => active && setForms((p) => ({ ...p, [active.key]: { sig, v: { ...f, [k]: v } } }));

  const L = active ? letters[active.key] : null;
  const letterOk = L && L.sig === sig;
  async function draft(g, s) {
    setLetters((p) => ({ ...p, [g.key]: { sig: s, text: "", busy: true, live: null } }));
    const base = groupTemplate(g);
    let text = base, live = false;
    try {
      const out = await callClaude("You write concise, professional payer appeal letters for physical therapy underpayments. Plain text, under 190 words, no markdown, no bullet symbols. Keep the Re: line and the sign-off. Do not invent facts.", "Rewrite this appeal letter so it is polished and firm while keeping every number and fact exactly as given:\n\n" + base);
      if (out && out.length > 150) { text = out.trim(); live = true; }
    } catch (e) { /* keep template */ }
    setLetters((p) => (p[g.key] && p[g.key].sig === s ? { ...p, [g.key]: { sig: s, text, busy: false, live } } : p));
  }
  useEffect(() => { if (step === 2 && active && !letterOk) draft(active, sig); }, [step, sig, active && active.key]);

  useEffect(() => {
    if (!menu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    const k = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [menu]);

  useEffect(() => {
    setAiHook({
      context: `The user is building an appeal package for ${items.length} underpaid claim${items.length > 1 ? "s" : ""} (step ${step} of 4: ${AP_STEPS[step - 1]}). Total disputed ${fmt(disputed)}, expected recovery ${fmt(recover)}. Earliest deadline ${soonest ? mdy(soonest.deadline) + " (" + soonest.daysLeft + " days left)" : "n/a"}. Groups: ${groups.map((g) => `${g.master}, ${PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid"}, ${g.claims.length} claims, ${fmt(r2(g.claims.reduce((s, c) => s + c.variance, 0)))}`).join(" | ")}. Reasons: ${[...new Set(items.map((c) => c.reason))].join(" ")} Documents included: ${chosen.map((d) => d.name).join(", ")}. Checklist: ${checklist.map((x) => x[0] + (x[1] ? " done" : " open")).join("; ")}. The packet has a cover letter, a payer dispute form, the contract excerpt, the 835 remittances and an itemized worksheet. After submission the payer has 30 days to respond.`,
      prompts: [{ q: "Which documents should I send?" }, { q: "Why this submission?" }, { q: "What happens after I submit?" }],
    });
  }, [items.length, step, chosen.length, disputed]);

  const next = () => { const n = Math.min(4, step + 1); setStep(n); setVisited({ ...visited, [n]: true }); };
  const status = (i) => (skipped[i] ? "Skipped" : i < step ? "Complete" : i === step ? "In progress" : visited[i] ? "In progress" : "Pending");
  const canNext = step === 1 ? items.length > 0 && doneCount >= 1 : step === 2 ? letterOk && !L.busy : true;
  const submit = () => {
    const batch = "APL-" + (4100 + Math.floor(Math.random() * 800));
    onSubmit(items.map((c) => c.id), batch, bulk);
    setDone({ batch, n: items.length, amt: disputed });
  };
  const addFiles = (list) => {
    const arr = [...list].map((f, i) => ({ id: "x-" + Date.now() + "-" + i, name: f.name, cat: "Other", up: "11/16/2026", by: "You", size: Math.max(1, Math.round(f.size / 1024)) + " KB" }));
    if (arr.length) setExtra((p) => [...p, ...arr]);
  };

  const topCrumb = bulk ? "Underpaid" : all[0] ? all[0].id : "Claims";
  const cats = ["All", "Contract", "Remittance", "Worksheet", "Other"];
  const shownDocs = docs.filter((d) => docTab === "All" || d.cat === docTab);
  const allShownOn = shownDocs.length > 0 && shownDocs.every(incl);
  const pillSel = groups.length > 1 && (
    <select className="pillsel" aria-label="Packet" value={active ? active.key : ""} onChange={(e) => setGk(e.target.value)}>
      {groups.map((g) => <option key={g.key} value={g.key}>{g.master}, {PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid"} ({g.claims.length})</option>)}
    </select>
  );

  if (done) return (
    <div className="flowwrap">
      <div className="fhead"><div className="fbc"><span className="bc-link">{topCrumb}</span><span className="bc-sep">/</span><span className="bc-cur">Create Appeal Package</span></div></div>
      <div className="emptyfull">
        <div className="emptyicon ok"><CheckCircle2 size={30} /></div>
        <div className="h2">{done.n > 1 ? `${done.n} appeals submitted` : "Appeal submitted"}</div>
        <p className="muted emptycopy">Batch {done.batch}. {fmt(done.amt)} in dispute. The payer has 30 days to respond, and each claim keeps its own deadline and status.</p>
        <div className="row gap"><button className="btn" onClick={onCancel}>Back to claims</button><button className="btn primary" onClick={onViewAppeals}>View appeals</button></div>
      </div>
    </div>
  );

  return (
    <div className="flowwrap">
      <div className="fhead">
        <div className="fbc"><span className="bc-link">{topCrumb}</span><span className="bc-sep">/</span><span className="bc-cur">Create Appeal Package</span></div>
        <div className="fhead-r">
          <div className="stepwrap" ref={menuRef}>
            <button className="stepbtn" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{step} of 4: {AP_STEPS[step - 1]}<ChevronDown size={14} /></button>
            {menu && (
              <div className="menu stepmenu" role="menu">
                {AP_STEPS.map((n, i) => (
                  <button key={n} role="menuitem" className={"step-i" + (step === i + 1 ? " on" : "")} disabled={i + 1 > step && !visited[i + 1]} onClick={() => { setStep(i + 1); setMenu(false); }}>
                    <span className="stepnum">{i + 1}</span><span><span className="b">{n}</span><span className="sub">{status(i + 1)}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="vdiv" />
          <button className="cancel" onClick={onCancel}>Cancel</button>
          {(step === 2 || step === 3) && <button className="btn outline" onClick={() => { setSkipped({ ...skipped, [step]: true }); next(); }}>Skip<SkipForward size={14} /></button>}
          {step < 4 ? <button className="btn primary" disabled={!canNext} onClick={next}>Continue<ArrowRight size={14} /></button>
            : <button className="btn primary" disabled={!items.length || doneCount < 4} onClick={submit}><Send size={14} />Submit {items.length > 1 ? items.length + " appeals" : "appeal"}</button>}
        </div>
      </div>

      {step === 1 && (
        <div className="flowbody"><div className="apcol">
          <AiBanner title="Pick the documents to send">
            Appealing <b>{items.length} of {all.length}</b> {all.length > 1 ? "claims" : "claim"} | Disputed <b>{fmt(disputed)}</b> | Documents <b>{chosen.length} selected</b> | Checklist <b>{doneCount} of 4</b> | Deadline <b>{soonest ? mdy(soonest.deadline) + " (" + soonest.daysLeft + " days)" : "n/a"}</b>
          </AiBanner>

          <ACard title="Type of appeal">
            <div className="radios">
              <label><input type="radio" name="aptype" checked={type === "full"} onChange={() => setType("full")} /><span>Full appeal packet <span className="muted">(Letter, form, documents)</span></span></label>
              <label><input type="radio" name="aptype" checked={type === "docs"} onChange={() => setType("docs")} /><span>Documents only <span className="muted">(No letter, no form)</span></span></label>
            </div>
          </ACard>

          {active && (
            <ACard title={bulk ? "Remittances you are appealing" : "Remittance you are appealing"} right={pillSel}>
              <div className="kv2">
                {[["Status", "Underpaid"], ["Index", "Primary"], ["Payer", active.master], ["Plan", f.plan], ["Reason", f.why], ["Claims", f.claims], ["Remit date", f.remit], ["Service date", f.service], ["Disputed", f.disputed], ["Appeal deadline", `${f.deadline} (${Math.min(...active.claims.map((c) => c.daysLeft))} days left)`], ["Contract", f.contractRef], ["Method", "Payer portal (simulated)"]].map(([k, v]) => <React.Fragment key={k}><span className="k2">{k}</span><span className="v2">{v}</span></React.Fragment>)}
                <span className="k2 span">Reason detail</span><span className="v2 span">{active.claims[0].reason}</span>
              </div>
            </ACard>
          )}

          <ACard title={bulk ? "Claims on this appeal" : "Procedures on this claim"} right={<span className="pillnote">{bulk ? "One packet per payer and reason (recommended)" : "One packet for this claim"}</span>}>
            <div className="plist">
              {all.map((c) => (
                <div key={c.id}>
                  <div className="prow">
                    <button className="icon" aria-label={openRow[c.id] ? "Collapse" : "Expand"} onClick={() => setOpenRow({ ...openRow, [c.id]: !openRow[c.id] })}>{openRow[c.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
                    <input type="checkbox" aria-label={"Include " + c.id} checked={!off[c.id]} onChange={(e) => setOff({ ...off, [c.id]: !e.target.checked })} />
                    <span className="pname">{c.id} <span className="muted">{c.plan}, {c.facility}</span></span>
                    <span className="grow" />
                    <Chip tone="grey">{PATTERN[c.pattern] ? PATTERN[c.pattern].short : "Underpaid"}</Chip>
                    {[...new Set(c.lines.map((l) => l.cpt))].slice(0, 3).map((x) => <span key={x} className="cpt">{x}</span>)}
                    <span className="cpt wide">{fmt(c.variance)} at stake</span>
                  </div>
                  {openRow[c.id] && (
                    <div className="pexp"><table className="tbl compact"><thead><tr><th>CPT</th><th className="r">Units</th><th className="r">Contracted</th><th className="r">Paid</th><th className="r">Shortfall</th></tr></thead>
                      <tbody>{c.lines.map((l, i) => { const e = c.lineExp[i]; const v = e == null ? 0 : r2(e - l.paid); return <tr key={i}><td className="b">{l.cpt}</td><td className="r">{l.units}</td><td className="r">{fmt(e || 0)}</td><td className="r">{fmt(l.paid)}</td><td className={"r" + (v > 0.005 ? " neg" : "")}>{v > 0.005 ? fmt(v) : fmt(0)}</td></tr>; })}</tbody></table></div>
                  )}
                </div>
              ))}
            </div>
          </ACard>

          <ACard title="Documentation">
            <div className="dz" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
              <span className="dzi"><Upload size={16} /></span>drop files here or <button className="link" onClick={() => fileRef.current.click()}>Browse Files</button>
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            <div className="tabs doctabs">{cats.map((c) => <button key={c} className={docTab === c ? "on" : ""} onClick={() => setDocTab(c)}>{c}</button>)}</div>
            <div className="tblwrap"><table className="tbl">
              <thead><tr><th style={{ width: 36 }}><input type="checkbox" aria-label="Select all documents" checked={allShownOn} onChange={() => { const n = { ...docOff }; shownDocs.forEach((d) => { if (allShownOn) n[d.id] = true; else delete n[d.id]; }); setDocOff(n); }} /></th><th>File</th><th>Category</th><th className="r">Uploaded</th><th>Uploaded by</th><th className="r">Size</th></tr></thead>
              <tbody>{shownDocs.map((d) => { const [k, tone] = kindOf(d.name); return (
                <tr key={d.id}><td><input type="checkbox" aria-label={"Include " + d.name} checked={incl(d)} onChange={(e) => setDocOff({ ...docOff, [d.id]: !e.target.checked })} /></td>
                  <td><Chip tone={tone}>{k}</Chip> <span className="doclink">{d.name}</span></td><td>{d.cat}</td><td className="r">{d.up}</td><td>{d.by}</td><td className="r">{d.size}</td></tr>); })}
                {!shownDocs.length && <tr><td colSpan={6} className="empty">No documents in this category.</td></tr>}</tbody></table></div>
          </ACard>
        </div></div>
      )}

      {(step === 2 || step === 3) && active && (
        <div className="fsplit even">
          <div className="apleft">
            {pillSel && <div className="packrow"><span className="muted">Packet</span>{pillSel}</div>}
            {step === 2 ? (
              <>
                <ACard title="Claim and appeal values">
                  <div className="fgrid">
                    <Fld label="Payer" value={f.payer} onChange={(v) => setF("payer", v)} />
                    <Fld label="Appeal level" value={f.level} onChange={(v) => setF("level", v)} />
                    <Fld label="Claims in this packet" value={f.claims} readOnly />
                    <Fld label="Amount disputed" value={f.disputed} readOnly />
                    <Fld label="Service date(s)" value={f.service} onChange={(v) => setF("service", v)} />
                    <Fld label="Remit date(s)" value={f.remit} onChange={(v) => setF("remit", v)} />
                    <Fld label="Contract reference" value={f.contractRef} onChange={(v) => setF("contractRef", v)} wide />
                    <Fld label="Date" value={f.date} onChange={(v) => setF("date", v)} />
                    <Fld label="Appeal deadline" value={f.deadline} readOnly />
                  </div>
                </ACard>
                <ACard title="Document text">
                  <AiBanner title="Athelas AI suggested a cover letter based on the contract and the remittance variance" />
                  <label className="fld wide area"><span>Edit document content here</span>
                    <textarea value={letterOk ? L.text : ""} disabled={!letterOk || L.busy} placeholder={letterOk && L.busy ? "Claude is drafting the letter" : ""} onChange={(e) => setLetters((p) => ({ ...p, [active.key]: { ...p[active.key], text: e.target.value } }))} rows={14} /></label>
                  {letterOk && !L.busy && <div className="muted small">{L.live ? "Drafted by Claude from the claim and contract data." : "Drafted from a template because the live draft was unavailable."}</div>}
                </ACard>
              </>
            ) : (
              <ACard title="Payer form fields" right={<select className="pillsel" aria-label="Change payer form" value={formType} onChange={(e) => setFormType(e.target.value)}><option>Provider payment dispute form</option><option>Reconsideration request form</option></select>}>
                <AiBanner title="Athelas AI mapped these values. Click any box to edit it." />
                <div className="fgrid">
                  <Fld label="Today's date" value={f.date} onChange={(v) => setF("date", v)} />
                  <Fld label="Payer" value={f.payer} onChange={(v) => setF("payer", v)} />
                  <Fld label="Plan" value={f.plan} onChange={(v) => setF("plan", v)} />
                  <Fld label="Provider name" value={f.provider} onChange={(v) => setF("provider", v)} />
                  <Fld label="TIN / NPI" value={f.tin} onChange={(v) => setF("tin", v)} />
                  <Fld label="Contact name and title" value={f.contact} onChange={(v) => setF("contact", v)} />
                  <Fld label="Contact phone" value={f.phone} onChange={(v) => setF("phone", v)} />
                  <Fld label="Contact address" value={f.address} onChange={(v) => setF("address", v)} wide />
                  <Fld label="Claim ID(s)" value={f.claimIds} onChange={(v) => setF("claimIds", v)} wide />
                  <Fld label="Service date(s)" value={f.service} onChange={(v) => setF("service", v)} />
                  <Fld label="Remittance date(s)" value={f.remit} onChange={(v) => setF("remit", v)} />
                  <Fld label="CPT codes disputed" value={f.cpt} onChange={(v) => setF("cpt", v)} />
                  <Fld label="Amount in dispute" value={f.disputed} onChange={(v) => setF("disputed", v)} />
                  <Fld label="Contract reference" value={f.contractRef} onChange={(v) => setF("contractRef", v)} wide />
                  <Fld label="Explanation of your request" value={f.explain} onChange={(v) => setF("explain", v)} wide area />
                </div>
              </ACard>
            )}
          </div>
          <div className="apright">
            <div className="pvhead">
              <div className="tabs">{["Package", "Claim Details", "Documentation"].map((t) => <button key={t} className={pv === t ? "on" : ""} onClick={() => setPv(t)}>{t}</button>)}</div>
            </div>
            {pv === "Package" && (
              <div className="pvbar">
                <button className="icon" aria-label="Zoom out" onClick={() => setZoom(Math.max(70, zoom - 10))}><ZoomOut size={16} /></button><span className="zoomv">{zoom}%</span><button className="icon" aria-label="Zoom in" onClick={() => setZoom(Math.min(160, zoom + 10))}><ZoomIn size={16} /></button>
                <span className="grow" /><span className="muted">1 of 1</span>
              </div>
            )}
            <div className="pvscroll">
              {pv === "Package" && step === 2 && (
                <div className="apaper" style={{ fontSize: 12 * zoom / 100 }}>
                  <div className="lh"><b>{f.provider}</b><div>{f.address}</div><div>{f.phone}</div></div>
                  <div className="ltxt">{`Date: ${f.date}\nTo: ${f.payer}, Appeals / Provider Disputes\n\n`}{letterOk ? L.text : "Drafting the letter..."}</div>
                </div>
              )}
              {pv === "Package" && step === 3 && (
                <div className="apaper form" style={{ fontSize: 12 * zoom / 100 }}>
                  <div className="ftitle"><b>{f.payer}</b><div>{formType}</div><div className="muted">Completion of this form is mandatory. Attach the documents that support your request.</div></div>
                  <div className="pgrid">
                    {[["Today's date", f.date], ["Plan", f.plan], ["Provider name", f.provider], ["TIN / NPI", f.tin], ["Contact name and title", f.contact], ["Contact phone", f.phone], ["Contact address", f.address, 1], ["Claim ID(s)", f.claimIds, 1], ["Service date(s)", f.service], ["Remittance date(s)", f.remit], ["CPT codes disputed", f.cpt], ["Amount in dispute", f.disputed], ["Contract reference", f.contractRef, 1]].map(([k, v, w]) => <div key={k} className={"pc" + (w ? " w" : "")}><span>{k}</span>{v}</div>)}
                  </div>
                  <div className="pc w tall"><span>Explanation of your request</span>{f.explain}</div>
                  <div className="muted">Submit through the {f.payer} provider portal. Keep a copy for your records.</div>
                </div>
              )}
              {pv === "Claim Details" && (
                <div className="tblwrap"><table className="tbl compact"><thead><tr><th>Claim</th><th>Service date</th><th className="r">Contracted</th><th className="r">Paid</th><th className="r">Shortfall</th></tr></thead>
                  <tbody>{active.claims.map((c) => <tr key={c.id}><td className="b">{c.id}</td><td>{mdy(c.dos)}</td><td className="r">{fmt(c.expected)}</td><td className="r">{fmt(c.paid)}</td><td className="r neg">{fmt(c.variance)}</td></tr>)}</tbody></table></div>
              )}
              {pv === "Documentation" && (
                <div className="tblwrap"><table className="tbl compact"><thead><tr><th>File</th><th>Category</th></tr></thead>
                  <tbody>{chosen.map((d) => <tr key={d.id}><td><Chip tone={kindOf(d.name)[1]}>{kindOf(d.name)[0]}</Chip> {d.name}</td><td>{d.cat}</td></tr>)}</tbody></table></div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flowbody"><div className="apcol">
          <AiBanner title={doneCount === 4 ? "Everything is ready to submit" : "Finish the checklist before you submit"}>
            {items.length} {items.length > 1 ? "appeals" : "appeal"} | Disputed <b>{fmt(disputed)}</b> | Expected recovery <b>{fmt(recover)}</b> | Checklist <b>{doneCount} of 4</b>
          </AiBanner>
          <ACard title="Checklist">
            <div className="check">{checklist.map(([k, ok]) => <div key={k} className="crow2">{ok ? <CheckCircle2 size={16} className="okc" /> : <AlertTriangle size={16} className="warnc" />}<span>{k}</span></div>)}</div>
          </ACard>
          <ACard title="Package contents">
            <div className="tblwrap"><table className="tbl compact"><thead><tr><th>Packet</th><th className="r">Claims</th><th className="r">Disputed</th><th>Letter</th><th>Payer form</th><th className="r">Documents</th></tr></thead>
              <tbody>{groups.map((g) => { const lt = letters[g.key]; return (
                <tr key={g.key}><td className="b">{g.master}, {PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid"}</td><td className="r">{g.claims.length}</td><td className="r">{fmt(r2(g.claims.reduce((s, c) => s + c.variance, 0)))}</td>
                  <td>{type === "docs" ? <Chip tone="grey">Not included</Chip> : skipped[2] ? <Chip tone="amber">Skipped</Chip> : lt ? <Chip tone="moss">Ready</Chip> : <Chip tone="grey">Template</Chip>}</td>
                  <td>{type === "docs" ? <Chip tone="grey">Not included</Chip> : skipped[3] ? <Chip tone="amber">Skipped</Chip> : <Chip tone="moss">Ready</Chip>}</td>
                  <td className="r">{chosen.filter((d) => !d.claim || g.claims.some((c) => c.id === d.claim)).length}</td></tr>); })}</tbody></table></div>
          </ACard>
          <ACard title="Submission">
            <div className="kv2">{[["Method", "Payer portal (simulated)"], ["Response due", "Within 30 days"], ["Earliest deadline", soonest ? mdy(soonest.deadline) + " (" + soonest.daysLeft + " days)" : "n/a"], ["Tracking", "Appeals page, per claim"]].map(([k, v]) => <React.Fragment key={k}><span className="k2">{k}</span><span className="v2">{v}</span></React.Fragment>)}</div>
          </ACard>
        </div></div>
      )}
    </div>
  );
}

/* ============================================================
   Appeals tracking
   ============================================================ */
function AppealsPage({ claims, respond }) {
  const list = claims.filter((c) => c.appeal).sort((a, b) => (a.appeal.on < b.appeal.on ? 1 : -1));
  const inDispute = list.filter((c) => c.appeal.status === "Submitted").reduce((s, c) => s + c.variance, 0);
  const won = list.filter((c) => c.appeal.status === "Won"), lost = list.filter((c) => c.appeal.status === "Denied");
  const rec = won.reduce((s, c) => s + c.variance, 0);
  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Appeals</h1></div>
        <button className="btn" disabled={!list.some((c) => c.appeal.status === "Submitted")} onClick={respond}><Clock size={14} />Simulate payer responses</button></div>
      <div className="summary"><div><div className="kv">{list.length}</div><div className="kl">appeals filed</div></div><div><div className="kv">{fmt(inDispute)}</div><div className="kl">in dispute</div></div><div><div className="kv moss">{fmt(rec)}</div><div className="kl">recovered</div></div>
        <div><div className="kv">{won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) + "%" : "n/a"}</div><div className="kl">win rate</div></div></div>
      <div className="tblwrap tall"><table className="tbl"><thead><tr><th>Appeal</th><th>Claim</th><th>Payer and plan</th><th>Reason</th><th>Filed</th><th>Response due</th><th className="r">In dispute</th><th>Status</th></tr></thead>
        <tbody>{list.map((c) => <tr key={c.id}><td className="b">{c.appeal.id}</td><td>{c.id}</td><td>{c.master}<span className="sub">{c.plan}</span></td><td>{PATTERN[c.pattern] ? PATTERN[c.pattern].short : "Underpaid"}</td><td className="nowrap">{fmtDate(c.appeal.on)}</td><td className="nowrap">{fmtDate(addDays(c.appeal.on, 30))}</td><td className="r">{fmt(c.variance)}</td><td>{statusChip(c)}</td></tr>)}
          {!list.length && <tr><td colSpan={8} className="empty">No appeals yet. Start from the Underpaid view on Claims.</td></tr>}</tbody></table></div>
    </div>
  );
}

/* ============================================================
   Analytics
   ============================================================ */
const BENCH = { "Cascadia Mutual Health": { lo: 2.8, med: 4.6, hi: 7.4 }, "Summit Care Alliance": { lo: 3.5, med: 5.9, hi: 9.2 }, "Keystone Health Partners": { lo: 5.0, med: 8.4, hi: 12.5 } };
const DIMS = { master: "Payer", facility: "Facility", group: "Payer group", apptType: "Appointment type" };
function AnalyticsPage({ claims, openFromAnalytics }) {
  const [dim, setDim] = useState("master");
  const [drill, setDrill] = useState(null);
  const base = claims.filter((c) => c.status !== "no_contract");
  const under = base.filter((c) => c.status === "underpaid");
  const groupBy = (arr, key) => { const m = {}; arr.forEach((c) => { const k = typeof key === "function" ? key(c) : c[key]; (m[k] = m[k] || []).push(c); }); return m; };
  const tot = groupBy(base, dim);
  const data = Object.entries(tot).map(([k, arr]) => ({ name: k, rate: r2((arr.filter((c) => c.status === "underpaid").length / arr.length) * 100), dollars: r2(arr.reduce((s, c) => s + c.variance, 0)), n: arr.length })).sort((a, b) => b.rate - a.rate);
  const overall = base.length ? (under.length / base.length) * 100 : 0;
  const avgVar = under.length ? under.reduce((s, c) => s + c.variance, 0) / under.length : 0;
  const perPct = 0.01 * 6750000 * avgVar;
  const drillClaims = drill ? base.filter((c) => c[dim] === drill) : [];
  const months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
  const trend = months.map((m) => { const arr = drillClaims.filter((c) => c.remitDate.slice(0, 7) === m); return { m: new Date(m + "-15").toLocaleDateString("en-US", { month: "short" }), rate: arr.length ? r2((arr.filter((c) => c.status === "underpaid").length / arr.length) * 100) : null }; });
  const reasons = Object.entries(groupBy(drillClaims.filter((c) => c.status === "underpaid"), (c) => (PATTERN[c.pattern] ? PATTERN[c.pattern].short : "Other"))).map(([k, a]) => ({ k, n: a.length, d: r2(a.reduce((s, c) => s + c.variance, 0)) }));
  const payerRows = Object.entries(groupBy(base, "master")).map(([k, a]) => ({ k, rate: (a.filter((c) => c.status === "underpaid").length / a.length) * 100, b: BENCH[k] })).filter((x) => x.b);
  const maxScale = Math.max(40, ...payerRows.map((x) => x.rate + 5));

  if (!base.length) return <div className="page"><div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Analytics</h1></div></div><div className="empty pad">Load a contract to see underpayment trends.</div></div>;
  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Analytics</h1></div><Chip tone="grey">Illustrative sample data</Chip></div>
      <div className="summary">
        <div><div className="kv">{overall.toFixed(1)}%</div><div className="kl">of claims underpaid</div></div>
        <div><div className="kv">{fmt(under.reduce((s, c) => s + c.variance, 0))}</div><div className="kl">underpaid in this sample</div></div>
        <div><div className="kv">{fmt(avgVar)}</div><div className="kl">average per underpaid claim</div></div>
        <div className="scale"><div className="kv">{"$" + (perPct / 1e6).toFixed(2) + "M"}</div><div className="kl">per year for every 1% of claims underpaid by this average, at ATI volume of about 6.75M claims a year</div></div>
      </div>
      <div className="panel">
        <div className="row between"><div className="h3">Underpayment rate</div><div className="seg">{Object.entries(DIMS).map(([k, v]) => <button key={k} className={dim === k ? "on" : ""} onClick={() => { setDim(k); setDrill(null); }}>{v}</button>)}</div></div>
        <div className="muted">Share of claims paid below the contracted amount. Select a bar to drill in.</div>
        <div style={{ height: Math.max(180, data.length * 46 + 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 30, right: 40, top: 10 }}>
              <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12, fill: "#1f1f1f" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, n, p) => [v + "% (" + fmt(p.payload.dollars) + " underpaid, " + p.payload.n + " claims)", "Rate"]} cursor={{ fill: "#f5f5f5" }} />
              <Bar dataKey="rate" radius={[0, 3, 3, 0]} onClick={(d) => setDrill(d.name === drill ? null : d.name)} cursor="pointer">
                {data.map((d) => <Cell key={d.name} fill={drill && drill !== d.name ? "#b9c3f8" : "#1132ee"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {drill && (
        <div className="panel">
          <div className="h3">{drill}</div>
          <div className="two">
            <div><div className="muted">Underpayment rate by remittance month</div>
              <div style={{ height: 190 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ left: 0, right: 20, top: 10 }}><CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} /><XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis unit="%" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={42} /><Tooltip formatter={(v) => [v + "%", "Rate"]} /><Line type="monotone" dataKey="rate" stroke="#1132ee" strokeWidth={2} dot={{ r: 3 }} connectNulls /></LineChart></ResponsiveContainer></div></div>
            <div><div className="muted">What is driving it</div>
              {reasons.map((r) => <div key={r.k} className="reason"><span>{r.k}</span><span className="b">{r.n} claims, {fmt(r.d)}</span></div>)}
              {!reasons.length && <div className="muted">No underpaid claims.</div>}
              <div className="b mt">Largest recoveries</div>
              {drillClaims.filter((c) => c.status === "underpaid").sort((a, b) => b.recover - a.recover).slice(0, 4).map((c) => <button key={c.id} className="linkrow" onClick={() => openFromAnalytics(c.id)}><span>{c.id}</span><span className="muted">{c.plan}</span><span className="neg b">-{fmt(c.variance)}</span></button>)}
            </div>
          </div>
        </div>
      )}
      <div className="panel">
        <div className="h3">How you compare with similar practices</div>
        <div className="muted">Underpayment rate by payer against outpatient PT groups of similar size. Benchmark values are illustrative. The shaded band is the middle half of the cohort.</div>
        <div className="cohort">
          {payerRows.map((x) => (
            <div key={x.k} className="crow"><div className="cname">{x.k}</div>
              <div className="ctrack"><div className="cband" style={{ left: (x.b.lo / maxScale) * 100 + "%", width: ((x.b.hi - x.b.lo) / maxScale) * 100 + "%" }} /><div className="cmed" style={{ left: (x.b.med / maxScale) * 100 + "%" }} /><div className={"cyou" + (x.rate > x.b.hi ? " hot" : "")} style={{ left: (x.rate / maxScale) * 100 + "%" }} /></div>
              <div className="cval"><span className="b">{x.rate.toFixed(1)}%</span><span className="muted"> vs {x.b.med}% median</span></div>
              <div className="cflag">{x.rate > x.b.hi ? <Chip tone="rust">{(x.rate / x.b.med).toFixed(1)}x the median</Chip> : x.rate > x.b.med ? <Chip tone="amber">Above median</Chip> : <Chip tone="moss">In line with peers</Chip>}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Connections and the Axiom answer
   ============================================================ */
function ConnectionsPage({ contracts, claims, createdTerms, ruleOn }) {
  const c = contracts.find((x) => x.id === "cascadia");
  const hmo = c && c.rows.find((r) => r.plan === "Select HMO");
  const authTerm = c && c.terms.find((t) => t.category === "Authorization");
  const stateTerm = c && c.terms.find((t) => t.category === "State");
  const under = claims.filter((x) => x.status === "underpaid" && x.contractId === "cascadia" && !x.appeal);
  const hmoAmt = c && hmo ? calcUnit(hmo, c, TODAY, ruleOn, false).amount : null;
  const st = (t) => (t && createdTerms[t.id] ? <Chip tone="moss"><Check size={12} />Rule active</Chip> : <Chip tone="grey">Suggested</Chip>);
  if (!c) return <div className="page"><div className="pagehead"><div><div className="crumb">Practice data</div><h1>Destination</h1></div></div><div className="empty pad">Load the Cascadia contract to see it feed the rest of the platform.</div></div>;
  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Practice data</div><h1>Destination</h1></div></div>
      <div className="muted lead">One contract, loaded once. Everything below reads from the same record, so nobody re-keys rates into a second system.</div>
      <div className="hub">
        <div className="hubcore"><FileText size={20} /><div className="b">{c.masterPayer}</div><div className="muted">{c.plans.length} plans, {c.rows.length} rate rows, {c.terms.length} terms</div></div>
        <div className="uses">
          <div className="use"><div className="b">Scheduling</div><div>Booking a Select HMO visit in Hartford shows the expected allowed amount before the patient arrives.</div><div className="stat">{hmoAmt != null ? fmt(hmoAmt) + " per visit" : ""}</div></div>
          <div className="use"><div className="b">Authorization</div><div>{authTerm ? authTerm.summary : "Visit limits and authorization triggers."}</div><div className="stat">{st(authTerm)}</div></div>
          <div className="use"><div className="b">Claim edits for state rules</div><div>{stateTerm ? stateTerm.summary : "State and license rules."}</div><div className="stat">{st(stateTerm)}</div></div>
          <div className="use"><div className="b">AR and appeals</div><div>Expected allowed prioritizes the AR worklist. The appeal deadline comes from the contract.</div><div className="stat">{under.length} open underpayments</div></div>
        </div>
      </div>
      <div className="h3 mt">Do ATI still need Syntellis Axiom and the billing calculators?</div>
      <div className="tblwrap"><table className="tbl answer"><thead><tr><th>Tool</th><th>What it does today</th><th>With the contract repository</th><th>Recommendation</th></tr></thead>
        <tbody>
          <tr><td className="b">Billing calculator</td><td>Clinicians pick CPT codes from treatment minutes.</td><td>Folds into the new EMR charge capture. Expected allowed comes from the repository.</td><td><Chip tone="rust">Retire</Chip></td></tr>
          <tr><td className="b">Excel Contract Grid and manual validation</td><td>Two people validate contracts for the whole company.</td><td>Claude reads the contract, a reviewer approves flagged items, and the QA record is kept.</td><td><Chip tone="rust">Retire</Chip></td></tr>
          <tr><td className="b">Syntellis Axiom, claim level</td><td>Models expected reimbursement from payer contracts. Waystar pushes CPTs to it.</td><td>Expected allowed is calculated per claim line at posting and compared with the 835.</td><td><Chip tone="rust">Not needed</Chip></td></tr>
          <tr><td className="b">Syntellis Axiom, planning</td><td>Budgeting and forecasting for finance.</td><td>Receives expected allowed and variance as a feed. Finance keeps its tool.</td><td><Chip tone="teal">Keep, integrate</Chip></td></tr>
        </tbody></table></div>
      <div className="panel">
        <div className="h3">If ATI keep Axiom for planning</div>
        <div className="muted">Proposal for discussion. No contract data is entered twice.</div>
        <div className="flow">
          <div className="fnode"><div className="b">Contract repository</div><div className="muted">Rates, terms, rules</div></div>
          <div className="fedge"><span>nightly, per payer and plan</span><i /></div>
          <div className="fnode"><div className="b">Data warehouse</div><div className="muted">Databricks. Also holds 835 and claims</div></div>
          <div className="fedge"><span>expected allowed and variance</span><i /></div>
          <div className="fnode"><div className="b">Syntellis Axiom</div><div className="muted">Budget and forecast models</div></div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Shell
   ============================================================ */
const CHAPTERS = [
  { k: "load", label: "Load", line: "One PDF becomes structured rates.", page: "contracts" },
  { k: "understand", label: "Understand", line: "Every expected allowed amount shows its math.", page: "contracts" },
  { k: "catch", label: "Catch", line: "Each 835 is checked against the contract at posting.", page: "claims" },
  { k: "recover", label: "Recover", line: "From variance to appeal in a few clicks.", page: "claims" },
  { k: "learn", label: "Learn", line: "See patterns by payer, site, and against peers.", page: "analytics" },
  { k: "connect", label: "Connect", line: "Load once. Scheduling, auth, and AR use it too.", page: "connections" },
];
const PD_PAGES = ["contracts", "fees", "hierarchy", "documents", "connections"];
const NAV = [
  { g: "Revenue Cycle", icon: Receipt, items: [["claims", "Claims", ["claims"]], ["appeals", "Appeals", ["appeals"]], ["analytics", "Analytics", ["analytics"]]] },
  { g: "Admin Panel", icon: BookOpen, items: [["contracts", "Practice Data", PD_PAGES]] },
];
const CM_ITEMS = [["contracts", "Contracts"], ["fees", "Fee schedules"], ["hierarchy", "Payer Hierarchy"], ["documents", "Documents"], ["connections", "Destination"]];
const OTHER_ITEMS = ["Line Item Options", "Write-Off Reasons", "Skip Collection Reasons", "Adjustment Types", "Provider Credentialing"];
function PracticeNav({ page, onGo, onInert }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="subnav2" aria-label="Practice data">
      <div className="sn-h">Billing</div>
      <div className="sn-group">
        <button className="sn-gh" aria-expanded={open} onClick={() => setOpen(!open)}><Circle size={16} /><span>Contract Management</span><ChevronUp size={20} className={open ? "" : "flipc2"} /></button>
        {open && (
          <div className="sn-body"><span className="sline" />
            <div className="sn-list">{CM_ITEMS.map(([k, l]) => <button key={k} className={"sn-item" + (page === k ? " on" : "")} onClick={() => onGo(k)}>{l}</button>)}</div>
          </div>
        )}
      </div>
      {OTHER_ITEMS.map((l) => <button key={l} className="sn-item top" onClick={onInert}><Circle size={16} />{l}</button>)}
    </aside>
  );
}
const CRUMBS = { claims: ["Revenue Cycle", "Claims"], appeals: ["Revenue Cycle", "Appeals"], analytics: ["Revenue Cycle", "Analytics"], contracts: ["Practice Data", "Contracts"], fees: ["Practice Data", "Fee schedules"], hierarchy: ["Practice Data", "Payer Hierarchy"], documents: ["Practice Data", "Documents"], connections: ["Practice Data", "Destination"] };

function AssistantPanel({ context, prompts = [], onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { if (end.current && end.current.scrollIntoView) end.current.scrollIntoView({ block: "end" }); }, [msgs, busy]);
  const h = new Date().getHours();
  const hello = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  async function ask(text, act) {
    const question = (text || "").trim();
    if (!question || busy) return;
    if (act) act();
    setMsgs((m) => [...m, { r: "u", t: question }]); setQ(""); setBusy(true);
    let answer;
    try {
      answer = await callClaude("You are Athelas AI, the assistant inside Air, a healthcare revenue cycle platform. Answer in under 80 words, plain text, no markdown. Use only the context provided. If the answer is not in the context, say so.", `Context:\n${context}\n\nQuestion: ${question}`);
    } catch (e) { answer = "I could not reach the assistant just now. Try again in a moment."; }
    setMsgs((m) => [...m, { r: "a", t: answer.trim() }]); setBusy(false);
  }
  return (
    <aside className="aipanel" aria-label="Athelas AI">
      <div className="aiscroll">
        {msgs.length === 0 ? (
          <div className="aihello">
            <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true"><g fill="#1132ee" fillOpacity=".5"><ellipse cx="48" cy="26" rx="14" ry="22" /><ellipse cx="48" cy="70" rx="14" ry="22" /><ellipse cx="26" cy="48" rx="22" ry="14" /><ellipse cx="70" cy="48" rx="22" ry="14" /></g><circle cx="48" cy="48" r="6" fill="#1132ee" /></svg>
            <div className="aigreet">{hello}</div>
            <div>How can I help you today?</div>
            <div className="aiprompts">{prompts.map((p) => <button key={p.q} className="link" onClick={() => ask(p.q, p.act)}>{p.q}</button>)}</div>
          </div>
        ) : (
          <div className="aichat">
            {msgs.map((m, i) => <div key={i} className={"aimsg " + m.r}>{m.r === "a" && <Sparkles size={14} />}<span>{m.t}</span></div>)}
            {busy && <div className="aimsg a"><Loader2 size={14} className="spin" /><span className="muted">Thinking</span></div>}
            <div ref={end} />
          </div>
        )}
      </div>
      {msgs.length === 0 && <button className="link aiteach" onClick={() => ask("Teach me about this page")}>Teach me about this page</button>}
      {msgs.length > 0 && <div className="aichips">{prompts.slice(0, 3).map((p) => <button key={p.q} className="aichip" onClick={() => ask(p.q, p.act)}>{p.q}</button>)}</div>}
      <div className="aibox">
        <input placeholder="Ask anything..." value={q} aria-label="Ask Athelas AI" onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(q)} />
        <div className="row between">
          <button className="icon" aria-label="Attach a file"><Upload size={16} /></button>
          <div className="row gap"><button className="icon" aria-label="Dictate"><Mic size={16} /></button><button className="send" aria-label="Send" disabled={!q.trim() || busy} onClick={() => ask(q)}><ArrowUp size={16} /></button></div>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  const [page, setPage] = useState("contracts");
  const [chapter, setChapter] = useState("load");
  const [rawContracts, setContracts] = useState([SUMMIT, KEYSTONE]);
  const [schedules, setSchedules] = useState([]);
  const [feeFlow, setFeeFlow] = useState(false);
  const contracts = useMemo(() => resolveContracts(rawContracts, schedules), [rawContracts, schedules]);
  const [ruleOn, setRuleOn] = useState({ "summit:pta": true, "keystone:pta": true });
  const [createdTerms, setCreatedTerms] = useState({});
  const [appeals, setAppeals] = useState({});
  const [upload, setUpload] = useState(false);
  const [drawerRow, setDrawerRow] = useState(null);
  const [doc, setDoc] = useState(null);
  const [view, setView] = useState("underpaid");
  const [openClaim, setOpenClaim] = useState(null);
  const [appealIds, setAppealIds] = useState(null);
  const [sel, setSel] = useState([]);
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(null);
  const [presenter, setPresenter] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiHook, setAiHook] = useState(null);
  const [ruleLog, setRuleLog] = useState([{ d: "Mar 12, 2026", t: "Apply PTA (CQ) services at the contract percentage: on" }]);

  useEffect(() => { if (!upload && !appealIds && !feeFlow) setAiHook(null); }, [upload, appealIds, feeFlow]);
  const loaded = contracts.some((c) => c.id === "cascadia");
  const claims = useMemo(() => CLAIMS.map((c) => derive(c, contracts, ruleOn, appeals)), [contracts, ruleOn, appeals]);
  const hero = claims.find((c) => c.id === HERO_ID);
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3800); };

  const publish = (c, quiet) => {
    setContracts((prev) => [...prev.filter((x) => x.id !== c.id), c]);
    setRuleOn((p) => ({ ...p, [c.id + ":escalator"]: !!c.escalatorPct, [c.id + ":pta"]: c.ptaPct != null }));
    setRuleLog((l) => [{ d: fmtDate(TODAY), t: `Rate rules applied from ${c.number} on publish` }, ...l]);
    if (!quiet) toast(`Published ${c.masterPayer}: ${c.plans.length} plans, ${c.rows.length} rate rows. Claims are now checked against it.`);
  };
  const go = (k) => {
    const ch = CHAPTERS.find((x) => x.k === k);
    setChapter(k); setUpload(false); setFeeFlow(false); setPage(ch.page); setOpenClaim(null); setAppealIds(null); setDrawerRow(null); setDoc(null);
    if (["understand", "catch", "recover", "learn"].includes(k) && !loaded) { publish(CASCADIA_CANON, true); toast("Loaded the sample Cascadia contract so this step has data."); }
    if (k === "catch") { setView("underpaid"); setSel([]); }
    setPending(k);
  };
  useEffect(() => {
    if (!pending || !loaded) return;
    if (pending === "understand") { const r = contracts.find((c) => c.id === "cascadia").rows.find((x) => x.plan.toLowerCase().includes("choice") && x.cpt === "97110"); if (r) setDrawerRow(r.id); }
    if (pending === "recover") { setView("underpaid"); setOpenClaim(HERO_ID); }
    setPending(null);
  }, [pending, loaded, contracts]);

  const startAppeal = (ids) => { setOpenClaim(null); setAppealIds(ids); };
  const submitAppeals = (ids, batch, bulk) => {
    setAppeals((p) => { const n = { ...p }; ids.forEach((id, i) => { n[id] = { id: bulk ? batch + "-" + (i + 1) : batch, status: "Submitted", on: TODAY }; }); return n; });
    setSel([]);
  };
  const respond = () => { setAppeals((p) => { const n = { ...p }; Object.keys(n).forEach((id) => { if (n[id].status === "Submitted") { const cl = CLAIMS.find((c) => c.id === id); n[id] = { ...n[id], status: cl.pattern === "bundling" ? "Denied" : "Won" }; } }); return n; }); toast("Payer responses received."); };
  const reset = () => { setContracts([SUMMIT, KEYSTONE]); setSchedules([]); setFeeFlow(false); setRuleOn({ "summit:pta": true, "keystone:pta": true }); setCreatedTerms({}); setAppeals({}); setSel([]); setOpenClaim(null); setAppealIds(null); setDrawerRow(null); setDoc(null); setUpload(false); setAiHook(null); setView("underpaid"); go("load"); };
  const openDoc = (id, hl, page) => setDoc({ id, hl, page });
  const detail = openClaim ? claims.find((c) => c.id === openClaim) : null;
  const thread = hero ? (hero.appeal ? (hero.appeal.status === "Won" ? `${fmt(hero.variance)} recovered` : "Appeal submitted") : hero.status === "underpaid" ? `${fmt(hero.variance)} underpaid` : hero.status === "no_contract" ? "No contract on file" : "Paid as expected") : "";
  const crumb = appealIds ? ["Claims", appealIds.length === 1 ? appealIds[0] : "Underpaid"] : CRUMBS[page];
  const underAll = claims.filter((c) => c.status === "underpaid");
  const baseContext = `Page: ${CRUMBS[page].join(" / ")}. Contracts on file: ${contracts.map((c) => `${c.masterPayer} (${c.plans.map((p) => p.plan + ", " + METHOD[p.method] + (p.discountPct ? " " + p.discountPct + "%" : "") + (p.flatRate ? " $" + p.flatRate : "")).join("; ")}; appeals due within ${c.disputeDays} days of remittance)`).join(" | ")}. Sample claims: ${claims.length}; underpaid: ${underAll.length} totalling ${fmt(underAll.reduce((s, c) => s + c.variance, 0))}; high recoverability and open: ${underAll.filter((c) => c.level === "High" && !c.appeal).length}; appeals filed: ${claims.filter((c) => c.appeal).length}. Featured claim ${HERO_ID}: ${hero ? hero.reason : ""} Expected allowed is calculated per claim line from the contract (fee schedule x rate, then escalator and PTA rules) and compared with the 835 at posting. Axiom: the billing calculator retires into the new EMR, Axiom is not needed for claim level expected reimbursement, and can stay for planning through a Databricks feed.`;
  const basePrompts = { contracts: [{ q: "Which payers have contracts on file?" }, { q: "How is expected allowed calculated?" }], connections: [{ q: "Do we still need Axiom?" }, { q: "Which teams use the contract?" }], fees: [{ q: "Which fee schedules are loaded?" }, { q: "Which contracts use the Medicare schedule?" }], hierarchy: [{ q: "Which payers have more than one plan?" }], documents: [{ q: "Which contracts have a document on file?" }], claims: [{ q: "Which underpaid claims should I appeal first?" }, { q: `Why was ${HERO_ID} flagged?` }], appeals: [{ q: "What is in dispute right now?" }], analytics: [{ q: "Which payer is furthest from peers?" }] }[page] || [];
  const wonTotal = claims.filter((c) => c.appeal && c.appeal.status === "Won").reduce((s, c) => s + c.variance, 0);

  return (
    <div className="app">
      <style>{CSS}</style>
      {presenter && (
        <div className="presenter">
          <div className="p-label">Presenter</div>
          <ol className="trail">
            {CHAPTERS.map((ch, i) => (
              <li key={ch.k} className={chapter === ch.k ? "cur" : CHAPTERS.findIndex((x) => x.k === chapter) > i ? "past" : ""}>
                <button onClick={() => go(ch.k)}><span className="pn">{i + 1}</span><span className="pl">{ch.label}</span></button>
              </li>
            ))}
          </ol>
          <div className="p-line">{CHAPTERS.find((x) => x.k === chapter).line}</div>
          <div className="p-thread" title="The claim we follow through the demo">
            <span className="muted">Following</span> <b>{HERO_ID}</b><span className="tag">{thread}</span>
            {wonTotal > 0 && <span className="tag moss">{fmt(wonTotal)} recovered in total</span>}
          </div>
          <button className="pbtn" onClick={reset}>Reset</button>
          <button className="pbtn" onClick={() => setPresenter(false)} aria-label="Hide presenter bar">Hide</button>
        </div>
      )}
      {!presenter && <button className="showp" onClick={() => setPresenter(true)}>Presenter</button>}
      <div className={"shell" + (upload || appealIds || feeFlow ? " flowing" : "")}>
        <nav className="sidecol" aria-label="Main">
          <div className="logo">Air</div>
          <div className="sidescroll">
            {NAV.map((g) => {
              const Ic = g.icon;
              return (
                <div key={g.g} className="sgroup">
                  <div className="shead"><Ic size={16} /><span>{g.g}</span><ChevronDown size={16} className="flip" /></div>
                  <div className="sbody"><span className="sline" />
                    <div className="slist">
                      {g.items.map(([k, l, keys]) => <button key={k} className={"ni" + (keys.includes(page) ? " on" : "")} onClick={() => { setPage(k); setOpenClaim(null); }}><span>{l}</span></button>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sfoot"><span className="avatar">LR</span><Settings size={16} /><span className="grow" /><HelpCircle size={16} /></div>
        </nav>
        <div className="rightcol">
          <header className="hdr">
            <div className="hdr-l"><PanelLeft size={16} /><div className="bc"><span className="bc-link">{crumb[0]}</span><span className="bc-sep">/</span><span className="bc-cur">{crumb[1]}</span></div></div>
            <div className="hdr-c"><Bell size={16} /><div className="gsearch"><Search size={16} />Global Search<span className="kbd">⌘K</span></div></div>
            <div className="hdr-r"><span className="aitab"><Mic size={16} />Scribe</span><button className={"aitab" + (aiOpen ? " on" : "")} aria-pressed={aiOpen} onClick={() => setAiOpen(!aiOpen)}><Sparkles size={16} />Athelas AI</button></div>
          </header>
          <div className="workrow">
          <main className={"canvas" + (upload || appealIds || feeFlow ? " flowing" : PD_PAGES.includes(page) ? " pdc" : "")}>
            {appealIds ? <AppealPackageFlow key={appealIds.join()} ids={appealIds} claims={claims} setAiHook={setAiHook} onCancel={() => setAppealIds(null)} onSubmit={submitAppeals} onViewAppeals={() => { setAppealIds(null); setPage("appeals"); }} /> : upload ? <AddContractFlow key={upload} mode={upload} setAiHook={setAiHook} onCancel={() => setUpload(false)} onPublish={(cs) => { cs.forEach((c) => publish(c, true)); setUpload(false); setChapter("understand"); toast(cs.length === 1 ? `Published ${cs[0].masterPayer}: ${cs[0].plans.length} plans, ${cs[0].rows.length} rate rows.${cs[0].id === "cascadia" ? " Claims are now checked against it." : ""}` : `Published ${cs.length} contracts to the repository.${cs.some((c) => c.id === "cascadia") ? " Claims are now checked against the Cascadia contract." : ""}`); }} /> : feeFlow ? <FeeScheduleFlow key={String(feeFlow.hint)} hint={feeFlow.hint} existing={[...deriveSchedules(rawContracts), ...schedules]} contracts={rawContracts} schedules={schedules} setAiHook={setAiHook} onCancel={() => setFeeFlow(false)} onPublish={(s) => { setSchedules((p) => [...p.filter((x) => x.id !== s.id), s]); setFeeFlow(false); setPage("fees"); toast(`Published ${s.name}: ${s.rows} codes.`); }} /> : <>
            {PD_PAGES.includes(page) ? (
              <div className="pd">
                <PracticeNav page={page} onGo={(k) => { setPage(k); setOpenClaim(null); }} onInert={() => toast("Not part of this demo")} />
                <section className="pd-main">
                  {page === "contracts" ? <ContractsPage contracts={contracts} ruleOn={ruleOn} setRuleOn={setRuleOn} createdTerms={createdTerms} setCreatedTerms={setCreatedTerms} onUpload={(m) => setUpload(m || "pdf")} drawerRow={drawerRow} setDrawerRow={setDrawerRow} openDoc={openDoc} toast={toast} claims={claims} ruleLog={ruleLog} setRuleLog={setRuleLog} />
                    : page === "fees" ? <FeeSchedulesPage contracts={contracts} rawContracts={rawContracts} schedules={schedules} onLoad={(h) => setFeeFlow({ hint: h })} />
                    : page === "hierarchy" ? <PayerHierarchyPage contracts={contracts} />
                    : page === "documents" ? <DocumentsPage contracts={contracts} openDoc={openDoc} onUpload={(m) => setUpload(m || "pdf")} />
                    : <ConnectionsPage contracts={contracts} claims={claims} createdTerms={createdTerms} ruleOn={ruleOn} />}
                </section>
              </div>
            ) : (
              <>
                {page === "claims" && <ClaimsPage claims={claims} view={view} setView={setView} sel={sel} setSel={setSel} openClaim={openClaim} setOpenClaim={setOpenClaim} startAppeal={startAppeal} loaded={loaded} goLoad={() => go("load")} />}
                {page === "appeals" && <AppealsPage claims={claims} respond={respond} />}
                {page === "analytics" && <AnalyticsPage claims={claims} openFromAnalytics={(id) => { setPage("claims"); setView("underpaid"); setOpenClaim(id); }} />}
              </>
            )}
            </>}
          </main>
          {aiOpen && <AssistantPanel context={aiHook ? aiHook.context : baseContext} prompts={aiHook ? aiHook.prompts : basePrompts} onClose={() => setAiOpen(false)} />}
          </div>
        </div>
      </div>
      {detail && page === "claims" && <ClaimFlyout d={detail} onClose={() => setOpenClaim(null)} startAppeal={startAppeal} openDoc={openDoc} />}
                  {doc && <DocModal doc={doc} contracts={contracts} onClose={() => setDoc(null)} />}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/* ============================================================
   Styles
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Source+Serif+4:wght@400;600&display=swap');
.app{
/* Design System 3.0 tokens (Theme collection) */
--fg1:#1f1f1f;--fg2:#454545;--fg3:#737373;--fg-dis:rgba(0,0,0,.4);--fg-accent:#1132ee;--on-accent:#fff;
--bs:rgba(0,0,0,.1);--bst:rgba(0,0,0,.2);
--base:#fff;--solid2:#f5f5f5;--tonal:#f1f3fe;--d5:rgba(0,0,0,.05);--d10:rgba(0,0,0,.1);
--accent:#1132ee;--accent-h:#0d27c0;--accent-sub:rgba(17,50,238,.1);--accent-sub-h:rgba(17,50,238,.06);
--danger:#b52b2b;--danger-sub:rgba(181,43,43,.1);--info:#416bcf;--info-sub:rgba(65,107,207,.1);
--t-red:rgba(181,43,43,.1);--t-orange:rgba(194,112,35,.1);--t-yellow:rgba(199,162,42,.1);--t-green:rgba(42,153,83,.1);--t-teal:rgba(36,147,136,.1);--t-blue:rgba(65,107,207,.1);--t-purple:rgba(174,66,176,.1);--t-neutral:rgba(89,89,89,.1);
--r-soft:8px;--r-semi:4px;--r-extra:12px;--r-card:16px;--r-full:100px;
font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--fg1);font-size:13px;line-height:1.6;height:100vh;display:flex;flex-direction:column;background:var(--tonal);font-variant-numeric:tabular-nums;position:relative}
.app *{box-sizing:border-box}
.app button{font-family:inherit;font-size:inherit;color:inherit;cursor:pointer}
.app :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.b{font-weight:500}.muted{color:var(--fg3)}.small{font-size:12px;line-height:1.4}.grow{flex:1}.nowrap{white-space:nowrap}.r{text-align:right}.mt{margin-top:18px}.pad{padding:14px}
.neg{color:var(--danger)}.warn{color:var(--fg1);font-weight:600}.moss{color:inherit}
.row{display:flex;align-items:center}.gap{gap:8px}.between{justify-content:space-between}.wrap{flex-wrap:wrap}
.inl{vertical-align:-2px;margin-right:6px}
h1{font-size:18px;font-weight:600;line-height:1.2;margin:0}.h2{font-size:18px;font-weight:600;line-height:1.3}.h3{font-size:14px;font-weight:600;margin-bottom:4px}
.crumb{font-size:12px;color:var(--fg3);line-height:1.4}.pagehead .crumb{display:none}

/* presenter bar (demo chrome, dark tokens so it never reads as product UI) */
.presenter{display:flex;align-items:center;gap:16px;background:#141414;color:#e5e5e5;padding:6px 14px;flex-wrap:wrap}
.p-label{font-weight:600;font-size:12px;color:#8a8a8a}
.trail{display:flex;list-style:none;margin:0;padding:0;gap:0;align-items:center}
.trail li{display:flex;align-items:center}
.trail li+li:before{content:"";width:16px;height:1px;background:rgba(255,255,255,.25);margin:0 2px}
.trail li.past+li:before,.trail li.cur:before{background:#e5e5e5}
.trail button{display:flex;align-items:center;gap:6px;border:0;background:transparent;padding:2px 10px 2px 4px;border-radius:var(--r-full);color:#e5e5e5;height:28px}
.trail button:hover{background:rgba(255,255,255,.1)}
.trail .pn{width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,.4);display:grid;place-items:center;font-size:11px;font-weight:500}
.trail li.past .pn{background:#e5e5e5;color:#141414;border-color:#e5e5e5}
.trail li.cur button{background:var(--accent);color:#fff}.trail li.cur .pn{border-color:#fff}
.trail .pl{font-weight:500}
.p-line{color:#b5b5b5;flex:1;min-width:200px}
.p-thread{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.08);border-radius:var(--r-soft);padding:2px 10px;height:28px}
.p-thread .muted{color:#9a9a9a}
.p-thread .tag{background:rgba(215,98,104,.2);color:#f0a3a6;border-radius:var(--r-soft);padding:0 8px;font-weight:500;font-size:12px}
.p-thread .tag.moss{background:rgba(95,199,133,.18);color:#8fdcab}
.pbtn{border:1px solid rgba(255,255,255,.2);background:transparent;border-radius:var(--r-full);padding:0 12px;height:28px;color:#e5e5e5}.pbtn:hover{background:rgba(255,255,255,.1)}
.showp{position:absolute;left:8px;bottom:52px;z-index:5;border:1px solid var(--bst);background:var(--base);border-radius:var(--r-full);padding:0 12px;height:28px;font-size:12px}

/* Air app shell */
.shell{flex:1;display:grid;grid-template-columns:200px 1fr;min-height:0;background:var(--tonal)}
.sidecol{display:flex;flex-direction:column;gap:16px;padding:8px;min-height:0}
.logo{font-weight:600;font-size:20px;letter-spacing:-.02em;padding:0 8px;height:32px;display:flex;align-items:center}
.sidescroll{flex:1;overflow:auto;border-bottom:1px solid var(--bs)}
.sgroup{display:flex;flex-direction:column;margin-bottom:4px}
.shead{display:flex;align-items:center;gap:6px;height:28px;font-weight:500;color:var(--fg2)}
.shead .flip{transform:rotate(180deg);margin-left:2px}
.sbody{display:flex}.sline{width:1px;background:var(--d10);margin:0 12px 12px 8px}
.slist{flex:1;display:flex;flex-direction:column;gap:2px;padding-bottom:12px;min-width:0}
.ni{display:flex;align-items:center;gap:6px;width:100%;text-align:left;background:transparent;border:0;color:var(--fg2);padding:0 8px;height:28px;border-radius:var(--r-soft);overflow:hidden;white-space:nowrap}
.ni span{overflow:hidden;text-overflow:ellipsis}
.ni:hover{background:var(--d5)}.ni.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.sfoot{display:flex;align-items:center;height:36px;padding-top:8px}
.avatar{width:28px;height:28px;border-radius:50%;border:1px solid var(--bst);display:grid;place-items:center;font-size:11px;font-weight:500;background:var(--base)}
.rightcol{display:flex;flex-direction:column;min-width:0;min-height:0;padding:0 8px 8px 0}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:4px 0;position:relative;height:36px;flex:none}
.hdr-l,.hdr-r{display:flex;align-items:center;gap:6px}
.hdr-l svg{color:var(--fg2);margin:0 6px}
.bc{display:flex;align-items:center}.bc-link{color:var(--fg3)}.bc-sep{color:var(--bst);padding:0 12px 0 12px}.bc-cur{font-weight:500}
.hdr-c{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:4px;top:4px;color:var(--fg2)}
.gsearch{display:flex;align-items:center;gap:4px;justify-content:center;width:320px;background:var(--d5);border-radius:var(--r-soft);padding:3px 6px;color:var(--fg3);position:relative}
.kbd{position:absolute;right:10px;font-size:12px;color:var(--fg-dis)}
.aitab{display:flex;align-items:center;gap:6px;height:28px;padding:0 8px;color:var(--fg-accent);font-weight:500}
.canvas{flex:1;min-height:0;overflow:auto;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);position:relative}
.page{padding:20px 24px 40px;max-width:1500px}
.pagehead{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:12px}

/* buttons, tags, tabs (DS: Button, Tag, Solid Tab Menu) */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;border:1px solid var(--bs);background:var(--base);border-radius:var(--r-full);padding:0 14px;font-weight:500;white-space:nowrap}
.btn:hover:not(:disabled){background:var(--d5)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.btn.primary:hover:not(:disabled){background:var(--accent-h)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.icon{border:0;background:transparent;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--fg2)}.icon:hover{background:var(--d5)}
.link{border:0;background:transparent;color:var(--fg-accent);font-weight:500;padding:0;height:28px}.link:hover{text-decoration:underline;text-underline-offset:2px}
.chip{display:inline-flex;align-items:center;gap:4px;height:24px;border-radius:var(--r-soft);padding:0 8px;font-size:13px;font-weight:500;background:var(--t-neutral);color:var(--fg1);margin-left:4px;white-space:nowrap}
.chip:first-child{margin-left:0}
.chip.teal{background:var(--t-teal)}.chip.navy{background:var(--t-blue)}.chip.plum{background:var(--t-purple)}.chip.amber{background:var(--t-yellow)}.chip.rust{background:var(--t-red)}.chip.moss{background:var(--t-green)}.chip.grey{background:var(--t-neutral)}
.sw{width:34px;height:20px;border-radius:10px;border:0;background:rgba(0,0,0,.25);position:relative;padding:0;flex:none}
.sw span{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}
.sw.on{background:var(--accent)}.sw.on span{left:16px}
.seg{display:inline-flex;gap:8px;align-items:center}
.seg button{height:28px;padding:0 6px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2)}
.seg button:hover:not(.on){background:var(--d5)}.seg button.on{background:var(--accent-sub);color:var(--fg-accent)}
.tabs{display:flex;gap:8px;align-items:center;margin-bottom:12px}
.tabs button{height:28px;padding:0 6px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);display:flex;align-items:center;gap:4px}
.tabs button:hover:not(.on){background:var(--d5)}.tabs button.on{background:var(--accent-sub);color:var(--fg-accent)}
.badge,.cnt{background:var(--d10);border-radius:10px;padding:0 6px;font-size:12px;line-height:18px;color:var(--fg1)}
.badge{background:var(--t-yellow);font-weight:600}
.search{display:flex;align-items:center;gap:6px;border-radius:6px;background:var(--d5);padding:0 8px;height:28px;width:300px;color:var(--fg3)}
.search input{border:0;outline:0;flex:1;font:inherit;background:transparent;color:var(--fg1)}

/* tables (DS: Data Table, Table Row compact, Table Heading Cell) */
.tblwrap{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);overflow:auto;max-width:100%}
.tblwrap.tall{max-height:calc(100vh - 360px)}.tblwrap.short{max-height:240px;margin-top:10px}
.tbl{border-collapse:separate;border-spacing:0;width:100%;font-size:13px}
.tbl th{position:sticky;top:0;background:var(--solid2);text-align:left;font-weight:400;color:var(--fg1);padding:0 8px;height:28px;border-bottom:1px solid var(--bs);white-space:nowrap;z-index:1}
.tbl td{padding:4px 8px;height:36px;border-bottom:1px solid var(--bs);vertical-align:middle;color:var(--fg2)}
.tbl tbody tr:last-child td{border-bottom:0}
.tbl th.r,.tbl td.r{text-align:right}

.tbl .sub{display:inline;margin-left:6px;font-size:12px;line-height:1.4;color:var(--fg3);font-weight:400}
.tbl td.b{color:var(--fg1)}

.clickrow{cursor:pointer}.clickrow:hover td{background:var(--accent-sub-h)}.clickrow.active td{background:var(--accent-sub)}
.empty{text-align:center;color:var(--fg3);padding:28px}
.answer td{vertical-align:middle}

/* score cards */
.kpis,.summary{display:flex;gap:12px;align-items:stretch;margin-bottom:12px;flex-wrap:wrap}
.kpis>div,.summary>div:not(.grow):not(.row){background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:10px 16px;min-width:150px}
.summary>.row{align-self:center}
.kv{font-size:22px;font-weight:600;line-height:1.2;letter-spacing:-.01em}.kl{font-size:12px;line-height:1.4;color:var(--fg3);max-width:260px}
.scale{max-width:360px}
.banner{display:flex;align-items:center;gap:12px;border-radius:var(--r-semi);padding:6px 12px;margin-bottom:12px;border-left:4px solid var(--info);background:var(--info-sub)}
.banner.amber{border-left-color:#c7a22a;background:rgba(199,162,42,.12);color:var(--fg1)}.banner span{flex:1}

/* contracts */
.page-tabs{margin-top:4px}
.cols{display:grid;grid-template-columns:230px 1fr;gap:16px;align-items:start}
.tree{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);padding:8px}
.tree-title{font-weight:500;color:var(--fg3);font-size:12px;padding:2px 8px 6px}
.tn{display:block;width:100%;text-align:left;border:0;background:transparent;padding:0 8px;height:28px;border-radius:var(--r-soft);color:var(--fg2)}
.tn:hover{background:var(--d5)}.tn.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.tn-row{display:flex;align-items:center}.tw{border:0;background:transparent;padding:2px;color:var(--fg3);display:grid;place-items:center}
.lvl2{padding-left:20px}.lvl3{padding-left:12px;display:flex;justify-content:space-between;align-items:center}.pt{font-size:11px;color:var(--fg3)}
.toolbar{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.content{min-width:0}
.termgroup{margin-bottom:22px}.term{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);padding:12px 14px;margin-bottom:10px}
.term-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.rulebox{display:grid;grid-template-columns:130px 1fr auto;gap:12px;align-items:center;background:var(--tonal);border:1px solid var(--accent-sub);border-radius:var(--r-soft);padding:10px 12px}
.rule-l{display:flex;gap:6px;align-items:center;color:var(--fg-accent)}
.rule-b .k{display:inline-block;width:44px;color:var(--fg3);font-weight:500}
.termrow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bs)}

/* drawer + modal (DS: Drawer, Modal, Overlay) */
.drawer{position:fixed;top:0;right:0;bottom:0;width:480px;background:var(--base);border-left:1px solid var(--bs);box-shadow:0 2px 16px rgba(0,0,0,.12);z-index:20;display:flex;flex-direction:column}
.drawer.wide{width:600px}
.drawer-head{display:flex;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--bs)}
.drawer-body{padding:16px 20px;overflow:auto;display:flex;flex-direction:column;gap:14px}
.whatif{display:flex;gap:24px}.k{font-size:12px;color:var(--fg3);margin-bottom:3px;line-height:1.4}
.chain{display:flex;flex-direction:column;border:1px solid var(--bs);border-radius:var(--r-soft);overflow:hidden}
.node{display:flex;align-items:center;gap:12px;padding:8px 14px;border-bottom:1px solid var(--bs);background:var(--base)}
.node.rule{background:var(--tonal)}.node.rule.off{background:var(--solid2);color:var(--fg3)}.node.rule.off .node-v{text-decoration:line-through}
.node-main{flex:1}.node-v{font-family:'Geist Mono',ui-monospace,monospace;font-weight:500;min-width:70px;text-align:right}
.node.total{background:#141414;color:#e5e5e5;border:0}.node.total .muted{color:#9a9a9a}.node.total .node-v{font-size:18px}
.note{display:flex;gap:8px;color:var(--fg3);font-size:12px;line-height:1.4}
.impact{display:flex;gap:12px;border-top:1px solid var(--bs);padding-top:12px}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.facts>div{background:var(--solid2);border-radius:var(--r-soft);padding:8px 10px}.facts .v{font-size:16px;font-weight:600}
.why{background:var(--danger-sub);border-left:4px solid var(--danger);border-radius:var(--r-semi);padding:8px 12px;display:flex;flex-direction:column;gap:3px}
.ccard{border:1px solid var(--bs);border-radius:var(--r-soft);padding:10px 12px;display:flex;flex-direction:column;gap:3px}
.quote{border-left:3px solid var(--accent);padding-left:10px;margin-top:6px;color:var(--fg1)}
.modal{position:fixed;inset:0;background:rgba(20,20,20,.45);z-index:30;display:grid;place-items:center;padding:20px}
.modal-card{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);width:min(760px,100%);max-height:94vh;display:flex;flex-direction:column;box-shadow:0 2px 16px rgba(0,0,0,.2);overflow:hidden}
.modal-card.wide{width:min(1240px,100%);height:min(780px,94vh)}.modal-card.doc{width:min(760px,100%);height:min(780px,94vh)}.modal-card.appeal{width:min(820px,100%)}
.modal-head{display:flex;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--bs)}
.steps{display:flex;gap:14px;margin-top:6px;color:var(--fg3);font-size:13px}.step{display:flex;align-items:center;gap:4px}.step.cur{color:var(--fg1);font-weight:500}.step.done{color:var(--fg-accent)}
.choose{padding:28px;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;flex:1}
.drop{border:1px dashed var(--bst);border-radius:var(--r-card);padding:40px 60px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--tonal);color:var(--fg-accent)}
.drop .muted{max-width:380px;text-align:center}.drop .b{color:var(--fg1)}
.split{flex:1;display:grid;grid-template-columns:42% 1fr;min-height:0}
.left{background:var(--solid2);overflow:auto;padding:16px;border-right:1px solid var(--bs)}
.right{overflow:auto;padding:16px 18px;min-width:0}
.paper{background:#fff;border:1px solid var(--bs);box-shadow:0 1px 4px rgba(0,0,0,.08);padding:30px 34px;font-family:'Source Serif 4',Georgia,serif;font-size:13px;line-height:1.65;color:var(--fg1)}
.paper-title{font-family:'Geist',sans-serif;font-size:12px;color:var(--fg3);margin-bottom:12px}
.paper-body{white-space:pre-wrap}
.pdfcard{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:50px;font-family:'Geist',sans-serif}
.hl{background:transparent;color:inherit}.hl.off{background:transparent}.hl:not(.off){background:rgba(199,162,42,.25);border-radius:2px}.hl.active{background:rgba(199,162,42,.55);box-shadow:0 0 0 2px rgba(199,162,42,.55)}
.stages{display:flex;flex-direction:column;gap:12px;padding:10px 6px}
.stage{display:flex;align-items:center;gap:10px;color:var(--fg3)}.stage.cur{color:var(--fg1);font-weight:500}.stage.done{color:var(--fg2)}.stage.done svg{color:#2a9953}
.dot{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--bst)}
.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.livebar{display:flex;align-items:center;gap:6px;font-size:12px;padding:3px 10px;border-radius:var(--r-soft);margin-bottom:10px;width:fit-content}
.livebar.live{background:var(--accent-sub);color:var(--fg-accent)}.livebar.cached{background:var(--t-yellow);color:var(--fg1)}
.review{display:flex;flex-direction:column;min-height:100%}
.foot{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:14px;border-top:1px solid var(--bs)}
.qa{display:flex;flex-direction:column;gap:2px}.qarow{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--bs)}.review-item{background:var(--t-yellow);padding:10px;border-radius:var(--r-soft);margin-top:6px;border:0;cursor:pointer}
.okc{color:#2a9953}.warnc{color:#c7a22a}
.docbody{flex:1;overflow:auto;padding:16px;background:var(--solid2)}
.appeal-body{padding:18px 22px;display:flex;flex-direction:column;gap:14px;overflow:auto}
.letter{display:flex;flex-direction:column;gap:10px}.letter textarea{width:100%;min-height:290px;border:1px solid var(--bst);border-radius:var(--r-soft);padding:12px;font:inherit;line-height:1.55;resize:vertical;color:var(--fg1)}
.pre{white-space:pre-wrap;font-family:inherit;background:var(--solid2);border:1px solid var(--bs);border-radius:var(--r-soft);padding:12px;margin:6px 0 12px}
.attach{display:flex;flex-direction:column;gap:5px}.attach label{display:flex;gap:8px;align-items:center}
.group{background:var(--solid2);border-radius:var(--r-soft);padding:8px 12px;margin-top:8px}
.donebox{padding:40px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.app input[type=checkbox]{accent-color:#1132ee;width:16px;height:16px}

/* analytics */
.panel{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);padding:14px 18px;margin-bottom:14px}
.two{display:grid;grid-template-columns:1.2fr 1fr;gap:28px;margin-top:8px}
.reason{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bs)}
.linkrow{display:flex;gap:12px;justify-content:space-between;width:100%;border:0;background:transparent;padding:6px 4px;border-bottom:1px solid var(--bs);text-align:left}.linkrow:hover{background:var(--accent-sub-h)}
.cohort{display:flex;flex-direction:column;gap:14px;margin-top:14px}
.crow{display:grid;grid-template-columns:190px 1fr 190px 130px;gap:14px;align-items:center}
.ctrack{position:relative;height:10px;background:var(--d5);border-radius:5px}
.cband{position:absolute;top:0;bottom:0;background:rgba(17,50,238,.18);border-radius:5px}
.cmed{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--fg3)}
.cyou{position:absolute;top:-4px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:var(--accent);border:3px solid #fff;box-shadow:0 0 0 1px var(--accent)}.cyou.hot{background:var(--danger);box-shadow:0 0 0 1px var(--danger)}

/* connections */
.lead{margin-bottom:14px;max-width:640px}
.hub{display:grid;grid-template-columns:260px 1fr;gap:16px;align-items:stretch}
.hubcore{background:#141414;color:#e5e5e5;border-radius:var(--r-extra);padding:18px;display:flex;flex-direction:column;gap:6px;justify-content:center}.hubcore .muted{color:#9a9a9a}
.uses{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.use{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:12px 14px;display:flex;flex-direction:column;gap:6px}.stat{margin-top:auto;font-weight:500;color:var(--fg1)}
.flow{display:flex;align-items:center;gap:0;margin-top:16px;flex-wrap:wrap}
.fnode{border:1px solid var(--bs);background:var(--tonal);border-radius:var(--r-soft);padding:12px 16px;min-width:200px}
.fedge{display:flex;flex-direction:column;align-items:center;min-width:150px;font-size:12px;color:var(--fg3);padding:0 8px}.fedge i{display:block;width:100%;height:2px;background:var(--accent);position:relative;margin-top:4px}.fedge i:after{content:"";position:absolute;right:-1px;top:-4px;border-left:8px solid var(--accent);border-top:5px solid transparent;border-bottom:5px solid transparent}

/* Practice Data secondary menu */
.pd{display:grid;grid-template-columns:208px 1fr;min-height:100%}
.subnav{padding:16px 12px;border-right:1px solid var(--bs);display:flex;flex-direction:column;gap:2px;align-self:stretch}
.sub-h{font-size:16px;font-weight:500;padding:0 12px 12px}
.sub-i{display:block;width:100%;text-align:left;height:36px;padding:0 12px;border:0;background:transparent;border-radius:var(--r-soft);color:var(--fg1);font-size:13px}
.sub-i:hover{background:var(--d5)}.sub-i.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.pd-main{min-width:0}
.pd .page{padding:16px 24px 40px;max-width:none}
.pd .pagehead{padding-bottom:12px;border-bottom:1px solid var(--bs);margin-bottom:14px;align-items:center}
.sfoot{gap:10px;color:var(--fg2)}
.avatar{background:var(--accent-sub);color:var(--fg-accent);border:0}
@media (max-width:1000px){.pd{grid-template-columns:1fr}.subnav{flex-direction:row;flex-wrap:wrap;border-right:0;border-bottom:1px solid var(--bs)}.sub-h{width:100%}.sub-i{width:auto}}

/* split button + menu (DS: Button group, Menu) */
.tabrow{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.tabact{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.sbtn-wrap{position:relative}
.sbtn{display:inline-flex;border-radius:var(--r-full);overflow:hidden;background:var(--accent)}
.sbtn button{border:0;background:transparent;color:var(--on-accent);height:28px;display:inline-flex;align-items:center;gap:4px;font-weight:500}
.sbtn-main{padding:0 14px}.sbtn-main:hover,.sbtn-caret:hover{background:var(--accent-h)}
.sbtn-caret{width:30px;justify-content:center;background:rgba(0,0,0,.25)!important;border-left:1px solid rgba(255,255,255,.18)!important}
.sbtn-caret:hover{background:rgba(0,0,0,.4)!important}
.menu{position:absolute;right:0;top:34px;z-index:15;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);box-shadow:0 2px 16px rgba(0,0,0,.12);padding:6px;min-width:220px}
.menu-i{display:flex;align-items:center;gap:10px;width:100%;height:36px;padding:0 12px;border:0;background:transparent;border-radius:var(--r-soft);text-align:left;color:var(--fg1)}
.menu-i:hover{background:var(--d5)}

/* Athelas AI panel + full-page add-contract flow */
.shell.flowing{grid-template-columns:1fr}.shell.flowing .sidecol{display:none}
.workrow{flex:1;display:flex;gap:8px;min-height:0}
.workrow .canvas{flex:1;min-width:0}
.canvas.flowing{overflow:hidden}
.aitab{border:0;background:transparent;border-radius:var(--r-soft)}.aitab.on{background:var(--accent-sub)}
.aipanel{width:276px;flex:none;display:flex;flex-direction:column;align-items:center;min-height:0;padding:8px 4px 0 4px}
.aiscroll{flex:1;min-height:0;overflow:auto;width:100%;display:flex;flex-direction:column;justify-content:center}
.aihello{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px}
.aigreet{font-size:18px;font-weight:600;margin-top:12px}
.aiprompts{display:flex;flex-direction:column;gap:10px;margin-top:36px}
.aiprompts .link{height:auto;line-height:1.4;text-align:center}
.aiteach{margin:12px 0}
.aichat{display:flex;flex-direction:column;gap:10px;padding:8px 4px;justify-content:flex-start;align-self:stretch}
.aiscroll:has(.aichat){justify-content:flex-start}
.aimsg{display:flex;gap:6px;font-size:13px;line-height:1.5}.aimsg.a svg{color:var(--fg-accent);flex:none;margin-top:3px}
.aimsg.u{align-self:flex-end;background:var(--accent-sub);border-radius:12px 12px 4px 12px;padding:6px 10px;max-width:92%}
.aichips{display:flex;flex-direction:column;gap:6px;width:100%;margin:8px 0}
.aichip{border:1px solid var(--bs);background:var(--base);border-radius:var(--r-full);padding:2px 12px;text-align:left;font-size:12px;line-height:1.5}.aichip:hover{background:var(--d5)}
.aibox{width:100%;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:10px 12px;display:flex;flex-direction:column;gap:10px;margin-bottom:4px}
.aibox input{border:0;outline:0;font:inherit;background:transparent;color:var(--fg1)}
.send{width:28px;height:28px;border-radius:50%;border:0;background:var(--accent);color:#fff;display:grid;place-items:center}.send:disabled{opacity:.4;cursor:not-allowed}
.icon.sel{background:var(--accent-sub);color:var(--fg-accent)}

.flowwrap{display:flex;flex-direction:column;height:100%;min-height:0}
.fhead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px 8px 20px;border-bottom:1px solid var(--bs);flex:none}
.fbc{display:flex;align-items:center}
.fhead-r{display:flex;align-items:center;gap:12px}
.vdiv{width:1px;height:20px;background:var(--bs)}
.cancel{border:0;background:transparent;color:var(--danger);font-weight:500;height:28px;padding:0 8px;border-radius:var(--r-full)}.cancel:hover{background:var(--danger-sub)}
.stepwrap{position:relative}
.stepbtn{height:28px;border:1px solid var(--accent);color:var(--fg-accent);background:var(--base);border-radius:var(--r-full);padding:0 12px;display:flex;align-items:center;gap:4px;font-weight:500}
.stepmenu{right:auto;left:0;top:34px;min-width:240px;padding:6px}
.step-i{display:flex;align-items:flex-start;gap:10px;width:100%;border:0;background:transparent;text-align:left;padding:8px 10px;border-radius:var(--r-soft)}
.step-i:hover:not(:disabled){background:var(--d5)}.step-i.on{background:var(--accent-sub)}.step-i:disabled{opacity:.5;cursor:not-allowed}
.stepnum{width:16px;height:16px;border:1px solid var(--fg2);border-radius:var(--r-semi);display:grid;place-items:center;font-size:11px;margin-top:3px;flex:none}
.step-i.on .stepnum{background:var(--accent);border-color:var(--accent);color:#fff}
.step-i .sub{display:block;font-size:12px;color:var(--fg3);line-height:1.4}
.emptyfull{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center}
.emptyicon{width:64px;height:64px;border-radius:50%;background:var(--accent-sub);color:var(--fg-accent);display:grid;place-items:center}
.emptycopy{max-width:480px;margin:0}
.dropbox{margin-top:8px;width:min(560px,100%);border:1px dashed var(--bst);border-radius:var(--r-card);padding:32px 24px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--tonal);color:var(--fg-accent)}
.dropbox .b{color:var(--fg1)}.dropbox .muted{color:var(--fg3)}
.fsplit{flex:1;min-height:0;display:grid;grid-template-columns:42% 1fr}
.dcol{display:flex;flex-direction:column;min-height:0;background:var(--solid2);border-right:1px solid var(--bs)}
.dochead{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid var(--bs);background:var(--base);flex:none;min-width:0}
.ellip{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.zoomv{min-width:40px;text-align:center}
.docscroll{flex:1;min-height:0;overflow:auto;padding:16px}
.rcol{min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
.aibanner{display:flex;align-items:flex-start;gap:10px;background:linear-gradient(90deg,var(--accent-sub),rgba(17,50,238,.03));border-radius:var(--r-extra);padding:12px 14px}
.aibanner>svg{color:var(--fg-accent);flex:none;margin-top:3px}
.sec{border:1px solid var(--bs);border-radius:var(--r-extra);background:var(--base);overflow:hidden}
.sec-h{display:flex;align-items:center;gap:6px;width:100%;border:0;background:transparent;padding:10px 14px;font-weight:600;font-size:14px;text-align:left}
.sec-b{padding:0 14px 14px}.sec-b .tblwrap{border-radius:var(--r-soft)}
.clickable{cursor:pointer}
.termrow.clickable,.qarow.clickable{width:100%;border:0;background:transparent;text-align:left;border-bottom:1px solid var(--bs);border-radius:0}
.termrow.clickable:hover,.qarow.clickable:hover{background:var(--accent-sub-h)}
.termrow.on,.qarow.on{background:var(--accent-sub)!important}
.lt{text-align:left;flex:1;min-width:0}.plain{border:0;background:transparent;padding:0;cursor:pointer}
.review-item.on{outline:1px solid var(--accent)}
.terms{display:flex;flex-direction:column}
.docbody{display:flex;flex-direction:column;padding:0}
@media (max-width:1000px){.fsplit{grid-template-columns:1fr}.aipanel{display:none}}

/* Create Appeal Package flow (layout follows the appeals prototype) */
.btn.outline{border-color:var(--accent);color:var(--fg-accent);background:var(--base)}.btn.outline:hover:not(:disabled){background:var(--accent-sub-h)}
.flowbody{flex:1;min-height:0;overflow:auto}
.apcol{max-width:880px;margin:0 auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.aibanner b{font-weight:600;color:var(--fg1)}
.acard{border:1px solid var(--bs);border-radius:var(--r-extra);background:var(--base)}
.acard-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px}
.acard-t{display:flex;align-items:center;gap:6px;border:0;background:transparent;font-weight:600;font-size:15px;padding:0}
.acard-t svg{color:var(--fg2)}.flipc{transform:rotate(-90deg)}
.acard-b{padding:0 14px 14px;display:flex;flex-direction:column;gap:10px}
.radios{display:grid;grid-template-columns:1fr 1fr;gap:12px}.radios label{display:flex;align-items:center;gap:8px}
.app input[type=radio]{accent-color:#1132ee;width:16px;height:16px}
.kv2{display:grid;grid-template-columns:130px 1fr 130px 1fr;gap:8px 12px;background:var(--solid2);border-radius:var(--r-soft);padding:10px 12px}
.k2{color:var(--fg3)}.v2{color:var(--fg1);min-width:0;overflow-wrap:anywhere}.span{grid-column:span 1}
.kv2 .k2.span{grid-column:1}.kv2 .v2.span{grid-column:2 / span 3}
.pillnote{background:var(--d5);border-radius:var(--r-soft);padding:2px 10px;font-size:12px}
.pillsel{height:28px;border:1px solid var(--bs);border-radius:var(--r-full);padding:0 10px;background:var(--base);font:inherit;color:var(--fg1);max-width:360px}
.plist{border:1px solid var(--bs);border-radius:var(--r-soft);overflow:hidden;background:var(--solid2)}
.prow{display:flex;align-items:center;gap:8px;padding:0 10px 0 4px;height:36px;flex-wrap:nowrap;border-bottom:1px solid var(--bs)}
.plist>div:last-child .prow{border-bottom:0}
.pname{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cpt{background:var(--base);border-radius:var(--r-full);padding:1px 10px;font-size:12px;white-space:nowrap;flex:none}
.pexp{padding:8px 12px 12px 44px;background:var(--base);border-bottom:1px solid var(--bs)}
.dz{display:flex;align-items:center;justify-content:center;gap:8px;border:1px dashed var(--bst);border-radius:var(--r-soft);padding:18px;background:var(--base)}
.dzi{width:32px;height:32px;border-radius:var(--r-soft);background:var(--d5);display:grid;place-items:center}
.doctabs{margin:0}.doctabs button{font-size:13px}
.doclink{color:var(--fg-accent)}
.fsplit.even{grid-template-columns:1fr 1fr}
.apleft{min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px;border-right:1px solid var(--bs)}
.packrow{display:flex;align-items:center;gap:8px}
.apright{min-height:0;display:flex;flex-direction:column;background:var(--solid2)}
.pvhead{padding:8px 12px 0;flex:none;background:var(--base);border-bottom:1px solid var(--bs)}.pvhead .tabs{margin-bottom:8px}
.pvbar{display:flex;align-items:center;gap:4px;padding:4px 12px;flex:none;background:var(--base);border-bottom:1px solid var(--bs)}
.pvscroll{flex:1;min-height:0;overflow:auto;padding:16px}
.apaper{background:#fff;border:1px solid var(--bs);box-shadow:0 1px 4px rgba(0,0,0,.08);padding:28px 32px;line-height:1.5;color:var(--fg1)}
.lh{text-align:center;margin-bottom:16px;line-height:1.4}
.ltxt{white-space:pre-wrap}
.ftitle{margin-bottom:12px;line-height:1.4}
.pgrid{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--bst);margin-bottom:-1px}
.pc{border:1px solid var(--bst);margin:0 -1px -1px 0;padding:3px 6px;min-height:34px}.pc.w{grid-column:1 / -1}.pc.tall{min-height:80px;margin-top:8px;border-width:1px}
.pc span{display:block;font-size:.78em;color:var(--fg3);line-height:1.2}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fld{position:relative;display:block;border:1px solid var(--bst);border-radius:var(--r-soft);padding:17px 10px 5px;background:var(--base)}
.fld.wide{grid-column:1 / -1}
.fld span{position:absolute;top:2px;left:10px;font-size:11px;color:var(--fg3);line-height:1.4}
.fld input,.fld textarea{width:100%;border:0;outline:0;background:transparent;font:inherit;color:var(--fg1);resize:vertical;padding:0}
.fld:focus-within{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.fld.ro{background:var(--solid2)}.fld.ro input{color:var(--fg2)}
.fld.area textarea{margin-top:2px;line-height:1.55}
.check{display:flex;flex-direction:column;gap:8px}.crow2{display:flex;align-items:center;gap:8px}
.emptyicon.ok{background:var(--t-green);color:#2a9953}

/* Contracts: Table Header, Table Group, settings popover (Design System 3.0) */
.thdr{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex-wrap:wrap}
.thdr .tabs{margin-bottom:0}
.hact{display:flex;align-items:center;gap:6px}
.tgl{width:28px;height:28px;border:0;border-radius:var(--r-soft);background:transparent;display:grid;place-items:center;color:var(--fg2);padding:0}
.tgl:hover:not(.on){background:var(--d5)}.tgl.on{background:var(--accent-sub);color:var(--fg-accent)}
.sf{display:flex;align-items:center;justify-content:space-between;gap:8px;width:180px;height:28px;padding:0 8px;border-radius:6px;background:var(--d5);color:var(--fg2)}
.sf input{border:0;background:transparent;outline:0;font:inherit;flex:1;min-width:0;color:var(--fg1)}.sf input::placeholder{color:var(--fg3)}
.sf:focus-within{box-shadow:0 0 0 2px var(--accent)}.sf input:focus-visible{outline:none}
.popwrap{position:relative}
.pop{position:absolute;z-index:15;top:36px;right:-8px;width:360px;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);box-shadow:0 2px 8px rgba(0,0,0,.06),0 10px 28px rgba(0,0,0,.08)}
.pop:before{content:"";position:absolute;top:-6px;right:16px;width:10px;height:10px;background:var(--base);border-left:1px solid var(--bs);border-top:1px solid var(--bs);transform:rotate(45deg)}
.pop.display{width:280px;right:0}
.prow2{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:10px 16px 4px}
.prow2:first-child{padding-top:14px}
.prow2.dis{opacity:.5}
.sub2{font-size:12px;line-height:1.4;color:var(--fg3)}
.pfoot{display:flex;justify-content:space-between;align-items:center;padding:10px 16px 12px;margin-top:8px;border-top:1px solid var(--bs)}
.hist{margin:8px 16px 0;border-top:1px solid var(--bs);padding-top:8px;max-height:140px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.4}
.hist>div{display:flex;gap:10px}.hist .muted{min-width:84px}
.dsec{padding:12px;border-bottom:1px solid var(--bs)}.dsec.cl{border-bottom:0;max-height:300px;overflow:auto}
.dprow{display:flex;align-items:center;justify-content:space-between}
.fsel{width:140px;height:28px;border:0;border-radius:6px;background:var(--d5);padding:0 8px;font:inherit;color:var(--fg1)}
.crowc{display:flex;align-items:center;gap:8px;height:30px;padding:0 4px}
.frow{display:flex;align-items:center;gap:8px;padding:4px 0;margin-bottom:8px}
.fchip{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 6px 0 12px;border-radius:var(--r-full);background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.fchip button{border:0;background:transparent;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:inherit;padding:0}.fchip button:hover{background:var(--d10)}
.btn.tert{border:0;background:transparent;color:var(--fg-accent)}.btn.tert:hover:not(:disabled){background:var(--accent-sub-h)}
.fmenu{left:0;right:auto;max-height:340px;overflow:auto}
.menu-h{font-size:12px;color:var(--fg3);padding:6px 12px 2px}
.gtbl{border-collapse:separate;border-spacing:0;width:100%;font-size:13px}
.gtbl th{position:sticky;top:0;z-index:2;background:var(--solid2);text-align:left;font-weight:400;color:var(--fg1);padding:0 8px;height:28px;border-bottom:1px solid var(--bs);white-space:nowrap}
.gtbl th.r,.gtbl td.r{text-align:right}
.gtbl td{padding:4px 8px;height:36px;border-bottom:1px solid var(--bs);vertical-align:middle;color:var(--fg2);background:var(--base)}
.gtbl td.b,.gtbl td .b{color:var(--fg1)}
.gtbl .sub{display:inline;margin-left:6px;font-size:12px;line-height:1.4;color:var(--fg3);font-weight:400}
.gtbl tr.grow2 td{height:28px;padding:0;background:var(--solid2)}
.ginner{position:sticky;left:0;display:flex;align-items:center;gap:12px;height:27px;padding-left:4px;width:max-content;max-width:calc(100vw - 340px)}
.gname{font-weight:500;color:var(--fg1)}.ginfo{color:var(--fg3);font-size:12px;white-space:nowrap}
.gcol{width:28px;height:28px;border:0;border-radius:50%;background:transparent;display:grid;place-items:center;color:var(--fg2);padding:0}.gcol:hover{background:var(--d5)}
.gact{display:flex;gap:4px;align-items:center}
.gbtn{width:20px;height:20px;border:0;border-radius:50%;background:transparent;display:grid;place-items:center;color:var(--fg2);padding:0}.gbtn:hover{background:var(--d10)}
.gtbl tr.drow td:first-child{border-left:6px solid var(--bs)}
.gtbl tr.drow:hover td{background:var(--accent-sub-h)}.gtbl tr.drow.active td{background:var(--accent-sub)}
.mt4{margin-top:4px}

/* rows: one line, 36px, scroll sideways instead of wrapping (DS Table Row, Compact) */
.tbl th,.tbl td,.gtbl th,.gtbl td{white-space:nowrap}
.tbl.answer td{white-space:normal;height:auto;padding:8px}
.tbl,.gtbl{min-width:max-content}
.tbl td,.gtbl td{height:36px;padding-top:0;padding-bottom:0;line-height:20px}
.tbl th,.gtbl th{line-height:20px}
.gtbl tr.grow2 td{height:27px;line-height:20px}
.tbl td .chip,.gtbl td .chip{vertical-align:middle}

/* Contracts toolbar as icon buttons, table fills the container */
.canvas.pdc{display:flex;flex-direction:column}
.pd{flex:1;min-height:0;grid-template-rows:minmax(0,1fr)}
.pd-main{overflow:auto;display:flex;flex-direction:column;min-height:0}
.pd-main>.page{flex:none}
.pd-main>.fillpage{flex:1;min-height:0;display:flex;flex-direction:column;padding-bottom:16px}
.tblwrap.fill{flex:1;min-height:120px;max-height:none}
.pop.searchpop{width:260px;right:-4px;padding:8px}
.sf.wide{width:100%}

/* merged Table Configuration popover (DS: 280px, grouping slot, drill-in menu items) */
.pop.settings{width:280px;right:-8px}
.cfg-s{padding:12px;border-bottom:1px solid var(--bs)}
.cfg-m{padding:12px 2px}
.mi{display:flex;align-items:flex-start;gap:8px;width:100%;min-height:36px;padding:6px 8px 6px 10px;border:0;background:transparent;border-radius:var(--r-soft);text-align:left;line-height:1.6}
.mi:hover{background:var(--d5)}
.mi-t{flex:1;display:flex;flex-direction:column;padding-top:1.5px;min-width:0}.mi-s{color:var(--fg3)}
.mi svg{color:var(--fg2);flex:none;margin-top:2px}
.cfg-h{display:flex;align-items:center;gap:4px;padding:8px 12px 8px 8px;border-bottom:1px solid var(--bs)}
.cfg-b{padding:8px 12px;max-height:300px;overflow:auto}
.cfg-b.rules{padding:0 0 4px}
.pop.settings .prow2{padding:10px 14px 4px;gap:12px}

/* real PDF viewer */
.pdfscroll{flex:1;min-height:0;overflow:auto;padding:12px;background:var(--solid2);position:relative}
.pdfpages{display:flex;flex-direction:column;align-items:center;gap:12px}
.pdfpage{position:relative;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.14);flex:none}
.pdfpage canvas{display:block}
.pdfhl{position:absolute;background:rgba(199,162,42,.3);border-radius:2px;mix-blend-mode:multiply;pointer-events:none}
.pdfhl.strong{background:rgba(255,196,0,.6);outline:2px solid rgba(255,170,0,.95)}
.cut{display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
.errbox{display:flex;align-items:flex-start;gap:12px;padding-top:14px}
.morerow{display:flex;justify-content:center;padding-top:10px}
.banner.nogap{margin-bottom:0}
.qarow[role=button]{cursor:pointer}
.rcol>*{flex:none}

/* multi-contract upload (layout from the ATI Demo design) */
.cbody{flex:1;min-height:0;display:flex}
.clist{width:168px;flex:none;border-right:1px solid var(--bs);padding:12px;display:flex;flex-direction:column;gap:4px;overflow:auto}
.clist-h{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--fg3);padding:0 8px 6px}
.citem{position:relative;display:flex;align-items:center;border-radius:var(--r-soft)}
.citem.on{background:var(--accent-sub)}
.citem-b{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:28px;padding:0 4px 0 6px;border:0;background:transparent;border-radius:var(--r-soft);color:var(--fg2);text-align:left}
.citem:hover:not(.on){background:var(--d5)}
.citem.on .citem-b{color:#0d28bf}
.citem-b svg{flex:none}
.citem-x{display:none;width:22px;height:22px;margin-right:2px;border:0;border-radius:50%;background:transparent;place-items:center;color:var(--fg3);padding:0;flex:none}
.citem:hover .citem-x,.citem.on .citem-x,.citem:focus-within .citem-x{display:grid}.citem-x:hover{background:var(--d10)}
.clist-add{margin-top:8px;align-self:flex-start}
.cmid{flex:1;min-width:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:12px}
.cmid>*{flex:none}
.cdoc{flex:1;min-width:0;border-left:1px solid var(--bs);display:flex;flex-direction:column;min-height:0;background:#fafafa}
.chead{font-size:18px;font-weight:600;color:var(--fg2);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.csub{margin-top:-8px}
.card{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:12px 14px}
.aisum{background:var(--tonal);border:1px solid #e6e6e6;border-radius:var(--r-card)}
.aisum-t{padding:10px 16px 8px;display:flex;flex-direction:column;gap:8px;font-size:15px;line-height:1.6}
.aisum-b{border-top:1px solid #e6e6e6;padding:16px;display:flex;flex-direction:column;gap:12px}
.b15{font-weight:500;font-size:15px;line-height:1.6}.b13{font-weight:500;font-size:13px}
.sublabel{font-size:14px;font-weight:500;color:#666;line-height:22px}
.qalist{display:flex;flex-direction:column;gap:6px}
.qacard{display:flex;gap:8px;align-items:center;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:8px 12px;cursor:pointer;font-size:13px}
.qacard:hover{background:var(--accent-sub-h)}.qacard.on{background:var(--accent-sub)}
.actcard{background:var(--base);border-radius:var(--r-extra);padding:12px;box-shadow:0 4px 5px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:8px}
.actcard.on{box-shadow:0 0 0 2px var(--accent)}.actcard.done{opacity:.8}
.actrow{display:flex;align-items:center;justify-content:space-between;gap:8px}
.plainb{border:0;background:transparent;padding:0;text-align:left;cursor:pointer}
.tagc.ok{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border-radius:var(--r-soft);background:var(--t-green);font-weight:500;white-space:nowrap}
.disc{border:1px solid var(--bs);border-radius:var(--r-extra);background:var(--base);padding:8px 12px}
.disc-h{display:flex;align-items:center;gap:8px}
.disc-t{flex:1;text-align:left;border:0;background:transparent;font-weight:500;font-size:15px;padding:0}
.tagc{display:inline-flex;align-items:center;height:28px;padding:0 8px;border-radius:var(--r-soft);background:rgba(50,171,188,.1);font-weight:500;white-space:nowrap}
.disc-b{padding-top:8px}
.reader{flex:1;min-height:0;display:flex;flex-direction:column;background:#fafafa}
.reader:fullscreen{background:#fafafa}
.rdbar{display:flex;align-items:center;gap:12px;padding:8px 12px;border-bottom:1px solid var(--bs);flex:none;flex-wrap:wrap;background:var(--base)}
.vsep{width:1px;height:18px;background:var(--d10);flex:none}
.rdpage{display:flex;align-items:center;gap:8px}
.rdpage input{width:47px;height:28px;border:1px solid var(--bs);border-radius:6px;padding:0 8px;font:inherit;background:var(--base);color:var(--fg1)}
.zsel{width:77px;height:28px;border:1px solid var(--bs);border-radius:6px;padding:0 6px;font:inherit;background:var(--base);color:var(--fg1)}
.rdbody{flex:1;min-height:0;display:flex}
.rdbody .pdfscroll{background:#fafafa}
.thumbs{width:64px;flex:none;border-right:1px solid var(--bs);overflow:auto;padding:8px;display:flex;flex-direction:column;gap:6px;background:var(--base)}
.thumb{height:56px;flex:none;border:1px solid var(--bs);border-radius:6px;background:var(--solid2);font-size:12px;color:var(--fg2)}
.thumb.on{border-color:var(--accent);color:var(--fg-accent);background:var(--accent-sub)}
.errbox.card{align-items:flex-start}
.apcol.wide{max-width:1180px}

/* Figma Table Header + secondary navigation (Contract Management) */
.th{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:8px}
.th-title{flex:1;min-width:240px;display:flex;flex-direction:column;gap:4px}
.th-h{font-size:18px;font-weight:600;line-height:normal;padding-bottom:4px;color:var(--fg1)}
.th-views{display:flex;gap:12px;align-items:center}
.th-views .tabs{margin-bottom:0}
.selbar{display:inline-flex;align-items:center;gap:12px;font-size:13px}.selbar b{font-weight:500}
.sf{width:240px}
.page.tp,.pd .page.tp{padding:12px;max-width:none}
.pd-main>.fillpage.tp{padding-bottom:12px}
.gtbl th.sel,.gtbl td.sel{width:36px;min-width:36px;padding:0 8px}
.gtbl td.sel{height:36px}
.subnav2{padding:12px;border-right:1px solid var(--bs);display:flex;flex-direction:column;gap:4px;align-self:stretch;width:208px;overflow:auto}
.sn-h{height:28px;display:flex;align-items:center;font-size:15px;font-weight:500;color:var(--fg2)}
.sn-group{display:flex;flex-direction:column}
.sn-gh{display:flex;align-items:center;gap:6px;height:28px;border:0;background:transparent;padding:0;font-weight:500;color:var(--fg2);width:100%;text-align:left}
.sn-gh span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.sn-gh svg{flex:none}.sn-gh svg:last-child{margin-left:2px}.flipc2{transform:rotate(180deg)}
.sn-body{display:flex}
.sn-list{flex:1;display:flex;flex-direction:column;gap:2px;padding-bottom:12px;min-width:0}
.sn-item{display:flex;align-items:center;gap:6px;width:100%;height:28px;padding:0 8px;border:0;background:transparent;border-radius:var(--r-soft);color:var(--fg2);text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sn-item:hover{background:var(--d5)}.sn-item.on{background:var(--accent-sub);color:#0d28bf}
.sn-item.top{padding:0}.sn-item svg{flex:none}
.cfg-h .muted{margin-left:auto;font-size:12px}

/* hover card on Expected allowed */
.hovr{display:inline-block;cursor:help;outline:none}
.hovr>.b{border-bottom:1px dotted var(--fg3)}
.hovr:focus-visible>.b{outline:2px solid var(--accent);outline-offset:2px;border-radius:2px}
.calc-pop{position:fixed;z-index:60;width:330px;display:flex;flex-direction:column;gap:6px;padding:12px;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);box-shadow:0 2px 8px rgba(0,0,0,.06),0 10px 28px rgba(0,0,0,.12);white-space:normal;text-align:left;font-weight:400;cursor:default;line-height:1.5;color:var(--fg1)}
.cp-h{font-weight:600;font-size:13px}
.cp-f{background:var(--solid2);border-radius:var(--r-soft);padding:6px 8px;font-family:'Geist Mono',ui-monospace,monospace;font-size:12px;overflow-wrap:anywhere}
.cp-row{display:flex;align-items:flex-start;gap:8px;padding:2px 0;border-bottom:1px solid var(--bs)}
.cp-row.off{color:var(--fg3)}.cp-row.off .cp-v{text-decoration:line-through}
.cp-l{flex:1;display:flex;flex-direction:column;min-width:0}.cp-l .muted{font-size:12px;line-height:1.4}
.cp-v{font-family:'Geist Mono',ui-monospace,monospace;font-weight:500;min-width:62px;text-align:right}
.cp-t{display:flex;justify-content:space-between;align-items:center;background:#141414;color:#e5e5e5;border-radius:var(--r-soft);padding:6px 10px;font-weight:600}
.cp-n{font-size:12px;color:var(--fg3);line-height:1.4}

/* fee schedule loader */
.cmid.wide2{flex:0 0 46%;min-width:420px}
.fee-prev{flex:1;background:var(--base)}
.fp-h{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--bs);flex:none}
.fp-b{flex:1;min-height:0;overflow:auto}
.fp-b .tbl{border-collapse:separate;border-spacing:0;min-width:max-content}
.fp-b tr.active td{background:var(--accent-sub)}
.fp-b tr.rm td{color:var(--fg3);text-decoration:line-through;background:var(--solid2)}
.fp-b tr.rm td:last-child{text-decoration:none}
.pad0{padding:2px 0 6px}
.emptyicon.bad{background:var(--t-red);color:var(--danger)}
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#141414;color:#e5e5e5;padding:8px 16px;border-radius:var(--r-soft);z-index:50;box-shadow:0 6px 8px rgba(0,0,0,.25);max-width:80vw}
@media (prefers-reduced-motion:reduce){.spin{animation:none}.sw span{transition:none}}
@media (max-width:1000px){.shell{grid-template-columns:1fr}.sidecol{display:none}.cols,.hub,.two{grid-template-columns:1fr}.split{grid-template-columns:1fr}.crow{grid-template-columns:1fr}.hdr-c{display:none}}
`;
