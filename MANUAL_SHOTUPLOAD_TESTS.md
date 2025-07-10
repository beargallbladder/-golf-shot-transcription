# 🧪 ShotUpload Component - Manual Testing Guide
**Test Environment**: https://beatmybag.com  
**API Endpoint**: https://golf-shot-transcription.onrender.com  
**Test Date**: December 2024

## 🎯 Pre-Test Setup

### Test Accounts Required
- **Standard User**: Regular Google account
- **Retailer User**: Account with retailer privileges
- **Admin User**: samkim@samkim.com (unlimited shots)

### Test Data Required
- **Valid Images**: 
  - Golf simulator screenshot (JPG, <5MB)
  - Phone photo of golf simulator (PNG, <5MB)
  - High-quality golf shot image (WebP, <5MB)
- **Invalid Images**:
  - Text file (.txt)
  - Oversized image (>5MB)
  - Corrupted image file
- **Test Emails**: customer@test.com, fitting@test.com

---

## 📋 TEST SCENARIO 1: Basic User Upload Flow

### Pre-conditions
- [ ] User logged in as standard account
- [ ] On Upload tab
- [ ] Network connection stable

### Test Steps
1. **File Selection via Click**
   - [ ] Click upload area
   - [ ] Select valid JPG image (<5MB)
   - [ ] Verify file appears in preview
   - [ ] Expected: Image preview displays correctly

2. **File Selection via Drag-Drop**
   - [ ] Drag valid PNG image to upload area
   - [ ] Drop image in upload zone
   - [ ] Verify drag-active state shows
   - [ ] Expected: Drop zone highlights, file accepted

3. **Language Selection**
   - [ ] Change language to Japanese
   - [ ] Change language to Korean
   - [ ] Change language to Spanish
   - [ ] Change back to English
   - [ ] Expected: Dropdown updates, description changes

4. **Image Upload & Analysis**
   - [ ] Upload valid golf simulator image
   - [ ] Verify loading spinner appears
   - [ ] Verify "AI is analyzing your shot..." message
   - [ ] Wait for analysis completion (≤10 seconds)
   - [ ] Expected: Loading state → Results display

5. **Results Display Verification**
   - [ ] Verify speed metric displays (mph)
   - [ ] Verify distance metric displays (yards)
   - [ ] Verify spin metric displays (rpm)
   - [ ] Verify launch angle displays (degrees)
   - [ ] Verify club type displays
   - [ ] Expected: All metrics visible and formatted correctly

6. **Personal Best Detection**
   - [ ] Check for personal best toast notification
   - [ ] Verify improvement message if applicable
   - [ ] Verify "FIRST [CLUB] SHOT" message for new clubs
   - [ ] Expected: Appropriate notification based on data

7. **Social Sharing**
   - [ ] Click Facebook share button
   - [ ] Verify Facebook opens in new tab
   - [ ] Click Twitter share button
   - [ ] Verify Twitter opens with correct text
   - [ ] Click Copy link button
   - [ ] Verify success toast appears
   - [ ] Test copied link in new browser tab
   - [ ] Expected: All share options work correctly

8. **Share Page Verification**
   - [ ] Click "View Full Share Page" button
   - [ ] Verify new tab opens with share page
   - [ ] Verify shot data displays correctly
   - [ ] Verify "Try It Yourself" button works
   - [ ] Expected: Share page loads with correct data

9. **Reset Functionality**
   - [ ] Click "Upload Another Shot" button
   - [ ] Verify upload area resets
   - [ ] Verify all form fields cleared
   - [ ] Expected: Clean state for new upload

### Expected Results
- [ ] All upload methods work
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] Share functionality works
- [ ] Reset works properly

---

## 📋 TEST SCENARIO 2: Retailer Enhanced Flow

### Pre-conditions
- [ ] User logged in as retailer account
- [ ] On Upload tab
- [ ] Retailer fields visible

### Test Steps
1. **Retailer Fields Display**
   - [ ] Verify "Retailer Shot Upload" title shows
   - [ ] Verify "Fitting Information" section visible
   - [ ] Verify customer email field present
   - [ ] Verify fitting session ID field present
   - [ ] Verify retailer notes textarea present
   - [ ] Verify voice notes section present
   - [ ] Verify fitting data checkbox present
   - [ ] Expected: All retailer-specific fields visible

2. **Form Field Testing**
   - [ ] Enter customer email: customer@test.com
   - [ ] Enter fitting session ID: FIT-2024-001
   - [ ] Enter retailer notes: "Driver fitting session"
   - [ ] Toggle fitting data checkbox ON
   - [ ] Expected: All fields accept input correctly

3. **Voice Transcription Testing**
   - [ ] Click voice recorder button
   - [ ] Verify recording indicator appears
   - [ ] Click stop recording
   - [ ] Verify processing indicator shows
   - [ ] Wait for transcription
   - [ ] Verify text adds to retailer notes
   - [ ] Expected: Voice transcription appends to notes

4. **Language Impact on Voice**
   - [ ] Set language to Japanese
   - [ ] Test voice transcription
   - [ ] Set language to Spanish
   - [ ] Test voice transcription
   - [ ] Expected: Language setting affects transcription

5. **Enhanced Analysis Upload**
   - [ ] Upload golf simulator image with all fields filled
   - [ ] Verify loading shows "AI is analyzing customer shot..."
   - [ ] Wait for enhanced analysis completion
   - [ ] Expected: Retailer-specific loading message

6. **Enhanced Results Display**
   - [ ] Verify "Enhanced Shot Analysis" title
   - [ ] Verify basic metrics (speed, distance, spin, launch)
   - [ ] Verify "Club Specifications" section appears
   - [ ] Verify club brand displays
   - [ ] Verify club model displays
   - [ ] Verify shaft information displays
   - [ ] Verify loft/lie angles display
   - [ ] Expected: Enhanced analysis data visible

7. **Customer Data Persistence**
   - [ ] Verify customer email saved with shot
   - [ ] Verify fitting session ID saved
   - [ ] Verify retailer notes saved
   - [ ] Verify fitting data flag set
   - [ ] Expected: All retailer data persists

8. **Retailer Sharing**
   - [ ] Verify sharing message includes fitting context
   - [ ] Test share buttons work with retailer data
   - [ ] Verify share page shows enhanced information
   - [ ] Expected: Retailer context in shared content

### Expected Results
- [ ] All retailer fields functional
- [ ] Enhanced analysis works
- [ ] Voice transcription works
- [ ] Customer data persists
- [ ] Sharing includes context

---

## 📋 TEST SCENARIO 3: Error Handling Flows

### Test Steps
1. **Invalid File Type**
   - [ ] Try to upload .txt file
   - [ ] Try to upload .doc file
   - [ ] Try to upload .pdf file
   - [ ] Expected: "Please upload an image file" error

2. **File Size Validation**
   - [ ] Try to upload >5MB image
   - [ ] Expected: "Image size must be less than 5MB" error

3. **Empty/Corrupted File**
   - [ ] Try to upload 0-byte file
   - [ ] Try to upload corrupted image
   - [ ] Expected: Appropriate error messages

4. **Network Error Simulation**
   - [ ] Start upload, then disconnect network
   - [ ] Reconnect after timeout
   - [ ] Expected: "Failed to analyze shot" error
   - [ ] Retry should work after reconnection

5. **Rate Limiting**
   - [ ] Upload multiple shots rapidly (if not admin)
   - [ ] Continue until rate limited
   - [ ] Expected: Rate limit message with reset time

6. **API Error Handling**
   - [ ] Test during API maintenance window
   - [ ] Expected: Graceful error handling
   - [ ] User-friendly error messages

### Expected Results
- [ ] All error cases handled gracefully
- [ ] Clear error messages displayed
- [ ] No crashes or broken states
- [ ] Retry functionality works

---

## 📋 TEST SCENARIO 4: User Experience Flows

### Mobile Responsiveness
1. **iPhone Testing (320px-375px)**
   - [ ] Upload area responsive
   - [ ] Form fields usable
   - [ ] Results display properly
   - [ ] Share buttons accessible
   - [ ] Expected: Full functionality on mobile

2. **Tablet Testing (768px-1024px)**
   - [ ] Layout adapts to tablet size
   - [ ] Touch interactions work
   - [ ] Voice recorder accessible
   - [ ] Expected: Optimized tablet experience

3. **Desktop Testing (1920px+)**
   - [ ] Full layout utilizes space
   - [ ] All features accessible
   - [ ] Drag-drop works properly
   - [ ] Expected: Optimal desktop experience

### Performance Testing
1. **Loading Performance**
   - [ ] Component loads <500ms
   - [ ] Image upload processes <5s
   - [ ] AI analysis completes <10s
   - [ ] Results display <200ms
   - [ ] Expected: All within performance targets

2. **Memory Usage**
   - [ ] Multiple uploads don't cause memory leaks
   - [ ] Image compression working
   - [ ] Component cleanup on unmount
   - [ ] Expected: Stable memory usage

### Accessibility Testing
1. **Keyboard Navigation**
   - [ ] Tab through all interactive elements
   - [ ] Enter/Space activate buttons
   - [ ] Escape cancels operations
   - [ ] Expected: Full keyboard accessibility

2. **Screen Reader**
   - [ ] Upload area properly labeled
   - [ ] Form fields have labels
   - [ ] Results announced properly
   - [ ] Expected: Screen reader compatible

---

## 📊 TEST EXECUTION TRACKING

### Test Session 1: Basic Flows
- **Date**: _____________
- **Tester**: _____________
- **Browser**: _____________
- **Results**: 
  - [ ] Basic Upload Flow: PASS/FAIL
  - [ ] Error Handling: PASS/FAIL
  - [ ] Share Functionality: PASS/FAIL

### Test Session 2: Retailer Flows
- **Date**: _____________
- **Tester**: _____________
- **Browser**: _____________
- **Results**:
  - [ ] Retailer Fields: PASS/FAIL
  - [ ] Enhanced Analysis: PASS/FAIL
  - [ ] Voice Transcription: PASS/FAIL

### Test Session 3: Cross-Browser
- **Chrome**: PASS/FAIL - _____________
- **Firefox**: PASS/FAIL - _____________
- **Safari**: PASS/FAIL - _____________
- **Edge**: PASS/FAIL - _____________

### Test Session 4: Mobile Devices
- **iPhone Safari**: PASS/FAIL - _____________
- **Android Chrome**: PASS/FAIL - _____________
- **Tablet**: PASS/FAIL - _____________

---

## 🚨 Issues Found

### Critical Issues
- [ ] None found
- [ ] Issue 1: _____________
- [ ] Issue 2: _____________

### Minor Issues
- [ ] None found
- [ ] Issue 1: _____________
- [ ] Issue 2: _____________

### Enhancement Opportunities
- [ ] None identified
- [ ] Enhancement 1: _____________
- [ ] Enhancement 2: _____________

---

## ✅ Test Completion Status

- [ ] All basic flows tested
- [ ] All retailer flows tested
- [ ] All error cases tested
- [ ] All devices tested
- [ ] All browsers tested
- [ ] Performance verified
- [ ] Accessibility verified

**Overall Status**: ⏳ **IN PROGRESS**  
**Completion**: ___% (___/50 test cases complete)

**Final Assessment**: _____________ 