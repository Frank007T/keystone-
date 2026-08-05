package com.keystone.backend.controller;

import com.keystone.backend.annotation.AuditLog;
import com.keystone.backend.entity.InvoiceEntity;
import com.keystone.backend.entity.SiteEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.InvoiceRepository;
import com.keystone.backend.repository.SiteRepository;
import com.keystone.backend.repository.WorkOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "*")
public class CustomerDataController {

    private final SiteRepository siteRepository;
    private final WorkOrderRepository workOrderRepository;
    private final InvoiceRepository invoiceRepository;

    public CustomerDataController(SiteRepository siteRepository, WorkOrderRepository workOrderRepository, InvoiceRepository invoiceRepository) {
        this.siteRepository = siteRepository;
        this.workOrderRepository = workOrderRepository;
        this.invoiceRepository = invoiceRepository;
    }

    private String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized.");
        }
        return auth.getName();
    }

    // --- SITES ---

    @GetMapping("/sites")
    public ResponseEntity<List<SiteDto>> getMySites() {
        return ResponseEntity.ok(siteRepository.findByCustomerEmail(getCurrentEmail()).stream().map(this::toSiteDto).collect(Collectors.toList()));
    }

    @PostMapping("/sites")
    public ResponseEntity<SiteDto> createSite(@RequestBody CreateSiteRequest request) {
        SiteEntity site = new SiteEntity();
        site.setName(request.name());
        site.setAddress(request.address());
        site.setContactName(request.contactName());
        site.setContactPhone(request.contactPhone());
        site.setStatus(request.status() != null ? request.status() : "ACTIVE");
        site.setCustomerEmail(getCurrentEmail());

        return ResponseEntity.ok(toSiteDto(siteRepository.save(site)));
    }

    @PutMapping("/sites/{id}")
    public ResponseEntity<SiteDto> updateSite(@PathVariable Long id, @RequestBody CreateSiteRequest request) {
        SiteEntity site = siteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));

        if (!site.getCustomerEmail().equalsIgnoreCase(getCurrentEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to modify site.");
        }

        site.setName(request.name());
        site.setAddress(request.address());
        site.setContactName(request.contactName());
        site.setContactPhone(request.contactPhone());
        if (request.status() != null) site.setStatus(request.status());

        return ResponseEntity.ok(toSiteDto(siteRepository.save(site)));
    }

    @DeleteMapping("/sites/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        SiteEntity site = siteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));

        if (!site.getCustomerEmail().equalsIgnoreCase(getCurrentEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to delete site.");
        }

        siteRepository.delete(site);
        return ResponseEntity.noContent().build();
    }

    // --- REQUESTS / WORK ORDERS ---

    @GetMapping("/requests")
    public ResponseEntity<List<WorkOrderDto>> getMyRequests() {
        return ResponseEntity.ok(workOrderRepository.findByCustomerEmail(getCurrentEmail()).stream().map(this::toWorkOrderDto).collect(Collectors.toList()));
    }

    @PostMapping("/requests")
    @AuditLog(action = "CREATE_ORDER", module = "REQUEST", description = "Created a service request", entityType = "WORK_ORDER")
    public ResponseEntity<String> createRequest(@RequestBody CreateRequestRequest request) {
        WorkOrderEntity workOrder = new WorkOrderEntity();
        workOrder.setTitle(request.title());
        workOrder.setDescription(request.description());
        workOrder.setSiteName(request.siteName());
        workOrder.setCustomerEmail(getCurrentEmail());
        workOrder.setPriority(request.priority());
        workOrder.setStatus("Pending");
        if (request.dueDate() != null && !request.dueDate().isBlank()) {
            workOrder.setDueDate(Instant.parse(request.dueDate()));
        }

        workOrderRepository.save(workOrder);
        return ResponseEntity.ok("Request created successfully.");
    }

    // --- INVOICES ---

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDto>> getMyInvoices() {
        return ResponseEntity.ok(invoiceRepository.findByCustomerEmail(getCurrentEmail()).stream().map(this::toInvoiceDto).collect(Collectors.toList()));
    }

    // Mappers & DTOs
    private SiteDto toSiteDto(SiteEntity site) {
        return new SiteDto(site.getId(), site.getName(), site.getAddress(), site.getContactName(), site.getContactPhone(), site.getStatus(), site.getCustomerEmail());
    }

    private WorkOrderDto toWorkOrderDto(WorkOrderEntity workOrder) {
        return new WorkOrderDto(
                workOrder.getId(), workOrder.getTitle(), workOrder.getDescription(),
                workOrder.getSiteName(), workOrder.getCustomerEmail(), workOrder.getAssignedToEmail(),
                workOrder.getPriority(), workOrder.getStatus(),
                workOrder.getDueDate() != null ? workOrder.getDueDate().toString() : null,
                workOrder.getCreatedAt() != null ? workOrder.getCreatedAt().toString() : null
        );
    }

    private InvoiceDto toInvoiceDto(InvoiceEntity invoice) {
        return new InvoiceDto(invoice.getInvoiceNumber(), invoice.getInvoiceDate().toString(), invoice.getAmount(), invoice.getStatus(), invoice.getCustomerEmail());
    }

    public record SiteDto(Long id, String name, String address, String contactName, String contactPhone, String status, String customerEmail) {}
    public record WorkOrderDto(Long id, String title, String description, String siteName, String customerEmail, String assignedToEmail, String priority, String status, String dueDate, String createdAt) {}
    public record InvoiceDto(String invoiceNumber, String invoiceDate, Double amount, String status, String customerEmail) {}
    public record CreateSiteRequest(String name, String address, String contactName, String contactPhone, String status) {}
    public record CreateRequestRequest(String title, String description, String siteName, String priority, String dueDate) {}
}